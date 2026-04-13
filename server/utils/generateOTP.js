import bcrypt from 'bcryptjs';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(otp, salt);
};

export const verifyOTP = async (otp, hashedOtp) => {
  return await bcrypt.compare(otp, hashedOtp);
};
