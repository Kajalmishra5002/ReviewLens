const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
//const { v2: cloudinary } = require('cloudinary');

const ErrorHandler = require('../middlewares/errorMiddleware').ErrorHandler;
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const generateResetPasswordToken = require('../utils/generateResetPasswordToken');
const generateEmailTemplate = require('../utils/generateForgotPasswordEmailTemplate');
const sendEmail = require('../utils/sendEmail');


// ================= REGISTER =================
exports.register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  if (password.length < 8 || password.length > 16) {
    return next(new ErrorHandler("Password must be 8-16 characters", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already exists", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "User",
    isVerified: false
  });

  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  try {
    const { verificationEmailTemplate } = require('../utils/emailTemplates');
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - ReviewLens",
      message: verificationEmailTemplate(user.name, resetUrl)
    });
    
    res.status(201).json({
      success: true,
      message: "Verification email sent. Please check your inbox."
    });
  } catch(err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Verification email failed to send", 500));
  }
});


// ================= LOGIN =================
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email and password required", 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  if (user.isVerified === false) {
    return next(new ErrorHandler("Please verify your email to log in", 401));
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  sendToken(user, 200, "Login successful", res);
});


// ================= GET USER =================
exports.getUser = catchAsyncErrors(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});


// ================= LOGOUT =================
exports.logout = catchAsyncErrors(async (req, res) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});


// ================= FORGOT PASSWORD =================
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const { resetToken, hashedToken, resetPasswordExpireTime } =
    generateResetPasswordToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = resetPasswordExpireTime;

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = generateEmailTemplate(resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Reset email sent",
    });

  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Email sending failed", 500));
  }
});


// ================= RESET PASSWORD =================
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, "Password reset successful", res);
});


// ================= UPDATE PASSWORD =================
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  );

  if (!isMatch) {
    return next(new ErrorHandler("Current password incorrect", 401));
  }

  if (req.body.newPassword !== req.body.confirmNewPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  user.password = await bcrypt.hash(req.body.newPassword, 10);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated",
  });
});


// ================= UPDATE PROFILE =================
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email, gender, mobileNumber } = req.body;

  const existing = await User.findOne({
    email,
    _id: { $ne: req.user._id },
  });

  if (existing) {
    return next(new ErrorHandler("Email already in use", 400));
  }

  let avatarData;

  if (req.files?.avatar) {
    const upload = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath,
      { folder: "avatars", width: 150 }
    );

    avatarData = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email, gender, mobileNumber, ...(avatarData && { avatar: avatarData }) },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Profile updated",
    user,
  });
});

// ================= VERIFY EMAIL =================
exports.verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorHandler("Verification token is invalid or has expired", 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;

  await user.save({ validateBeforeSave: false });

  // Optional: Send Welcome email after successful verification
  try {
    const { welcomeEmailTemplate } = require('../utils/emailTemplates');
    await sendEmail({
      email: user.email,
      subject: "Welcome to ReviewLens",
      message: welcomeEmailTemplate(user.name)
    });
  } catch(err) {
    // Ignore error for welcome email
  }

  res.status(200).json({
    success: true,
    message: "Email successfully verified. You can now log in."
  });
});