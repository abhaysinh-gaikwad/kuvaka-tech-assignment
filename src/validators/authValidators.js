const yup = require("yup");

const mobileSchema = yup
  .string()
  .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits and numeric")
  .required("Mobile number is required");

const signupSchema = yup.object({
  mobile: mobileSchema,
  name: yup
    .string()
    .max(100, "Name must not exceed 100 characters")
    .required("Name is required")
});

const sendOTPSchema = yup.object({
  mobile: mobileSchema
});

const verifyOTPSchema = yup.object({
  mobile: mobileSchema,
  otp: yup
    .string()
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .required("OTP is required")
});

const forgotPasswordSchema = yup.object({
  mobile: mobileSchema
});

const changePasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .required("Password is required")
});

module.exports = {
  signupSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  changePasswordSchema
};
