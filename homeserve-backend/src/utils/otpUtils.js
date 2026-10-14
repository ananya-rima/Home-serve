const bcrypt = require('bcryptjs');

const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const hashOtp = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

const compareOtp = (candidate, hash) => bcrypt.compare(candidate, hash);

module.exports = { generateOtp, hashOtp, compareOtp };
