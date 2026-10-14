const asyncHandler = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/responseUtils');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getExpiryDate,
} = require('../utils/tokenUtils');
const { generateOtp, hashOtp, compareOtp } = require('../utils/otpUtils');
const { sendOtpEmail } = require('../utils/emailUtils');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Otp = require('../models/Otp');

const OTP_MAX_ATTEMPTS = 5;

class AuthController {
  
  register = asyncHandler(async (req, res) => {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      throw new ApiError(400, 'All fields are required');
    }
    if (password !== confirmPassword) {
      throw new ApiError(400, 'Password and confirm password do not match');
    }

    
    const allowedRoles = ['customer', 'provider'];
    const finalRole = allowedRoles.includes(role) ? role : 'customer';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const userData = { name, email, phone, password, role: finalRole };

    if (finalRole === 'provider') {
      const { experience, description, location, skills, serviceAreas } = req.body;
      Object.assign(userData, {
        experience: experience || 0,
        description: description || '',
        location: location || '',
        skills: Array.isArray(skills) ? skills : [],
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
        isApproved: false,
        approvalStatus: 'pending',
      });
    }

    const user = await User.create(userData);
    await this._issueAndSendOtp(user);

    return sendSuccess(res, 201, 'Account created. Please verify your email with the OTP sent to you.', {
      email: user.email,
      otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_MIN) || 5,
    });
  });

  
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (user.status === 'blocked') {
      throw new ApiError(403, 'Your account has been blocked. Contact support.');
    }

    if (!user.isEmailVerified) {
      await this._issueAndSendOtp(user);
      throw new ApiError(403, 'Your email is not verified yet. We have sent a new verification code to your inbox.');
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getExpiryDate(process.env.JWT_REFRESH_EXPIRES_IN),
    });

    return sendSuccess(res, 200, 'Login successful', {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    });
  });

  
  verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ApiError(400, 'Email and otp are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ApiError(401, 'Invalid email or OTP');

    const otpDoc = await Otp.findOne({ userId: user._id, purpose: 'email_verification' }).sort({ createdAt: -1 });
    if (!otpDoc || otpDoc.expiresAt < new Date()) {
      throw new ApiError(400, 'OTP expired or not found. Please request a new one.');
    }

    if (otpDoc.attempts >= OTP_MAX_ATTEMPTS) {
      await otpDoc.deleteOne();
      throw new ApiError(429, 'Too many incorrect attempts. Please request a new OTP.');
    }

    const isValid = await compareOtp(otp, otpDoc.otpHash);
    if (!isValid) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      throw new ApiError(400, 'Invalid OTP');
    }

    await otpDoc.deleteOne();

    user.isEmailVerified = true;
    await user.save();

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: getExpiryDate(process.env.JWT_REFRESH_EXPIRES_IN),
    });

    return sendSuccess(res, 200, 'Email verified. Login successful', {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    });
  });

  
  resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, 'Email is required');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
     
      return sendSuccess(res, 200, 'If an account exists, a new OTP has been sent.');
    }
    if (user.status === 'blocked') {
      throw new ApiError(403, 'Your account has been blocked. Contact support.');
    }
    if (user.isEmailVerified) {
      return sendSuccess(res, 200, 'Your email is already verified. Please log in.');
    }

    await this._issueAndSendOtp(user);
    return sendSuccess(res, 200, 'If an account exists, a new OTP has been sent.');
  });

  
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, 'Refresh token is required');
    }

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      throw new ApiError(401, 'Refresh token is invalid or expired');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new ApiError(401, 'Refresh token is invalid or expired');
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'blocked') {
      throw new ApiError(401, 'User no longer has access');
    }

    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });

    return sendSuccess(res, 200, 'Access token refreshed', { accessToken: newAccessToken });
  });

  
  logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    return sendSuccess(res, 200, 'Logged out successfully');
  });

 
  getCurrentUser = asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, 'Current user fetched', req.user.toSafeObject());
  });

  
  _issueAndSendOtp = async (user) => {
    await Otp.deleteMany({ userId: user._id, purpose: 'email_verification' });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + (Number(process.env.OTP_EXPIRES_MIN) || 5) * 60 * 1000);

    await Otp.create({ userId: user._id, otpHash, purpose: 'email_verification', expiresAt });
    await sendOtpEmail(user.email, otp);
  };
}

module.exports = new AuthController();
