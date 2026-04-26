const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    select: false // 🔐 important (hidden by default)
  },

  role: {
    type: String,
    enum: ['User', 'Admin', 'Seller'],
    default: 'User'
  },

  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },

  mobileNumber: {
    type: String,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },

  avatar: {
    public_id: String,
    url: String
  },

  purchaseHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],

  // 🔐 Password reset fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },

  // 📧 Email verification fields
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date

}, { timestamps: true });


// ================= HASH PASSWORD =================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// ================= COMPARE PASSWORD =================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ================= GENERATE EMAIL VERIFICATION TOKEN =================
userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to emailVerificationToken field
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Set expire time to 24 hours
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};


// ================= EXPORT =================
module.exports = mongoose.model('User', userSchema);