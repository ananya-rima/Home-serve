const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/responseUtils');
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');


const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Access token is required');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired access token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }
  if (user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been blocked');
  }

  
  req.user = user;
  next();
});

module.exports = { authenticate };
