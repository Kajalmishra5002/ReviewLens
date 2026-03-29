const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
  address: [{ street: String, city: String, state: String, zip: String }],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);