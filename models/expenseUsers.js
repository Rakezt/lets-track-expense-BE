const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const expenseUser = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
  },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
});

expenseUser.pre('Save', async function () {
  if (this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

expenseUser.methods.verifyPassword = function (raw) {
  return bcrypt.compare(raw, this.passwordHash);
};

module.exports = mongoose.model('ExpenseUser', expenseUser);
