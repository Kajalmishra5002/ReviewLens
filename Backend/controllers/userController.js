const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');
const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');

// ================= REGISTER =================
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  console.log("Registration Request Body:", req.body);
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please enter name, email & password", 400));
  }

  const user = await User.create({
    name,
    email,
    password, // Hashing is handled by pre-save hook in User model
    isVerified: true
  });

  console.log("User created successfully:", user);
  sendToken(user, 201, "User registered successfully", res);
});

// ================= LOGIN =================
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("Login Request Body:", { email });

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, "Login successful", res);
});

// ================= GOOGLE LOGIN =================
exports.googleLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, name } = req.body;
  console.log("Google Login Request:", { email, name });

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: Math.random().toString(36).slice(-10), // Random password for OAuth
      isVerified: true
    });
    console.log("New OAuth user created:", user._id);
  }

  sendToken(user, 200, "Google Login successful", res);
});

// ================= GET PROFILE =================
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user
  });
});

// ================= UPDATE PROFILE =================
exports.updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, city, gender, dob, addresses } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      name, 
      email, 
      mobileNumber: phone, 
      city, 
      gender, 
      dob, 
      addresses 
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user
  });
});
