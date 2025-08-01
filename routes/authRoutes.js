const express = require('express');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const ExpenseUser = require('../models/expenseUsers');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (await ExpenseUser.findOne({ username }))
      res.status(400).json({ message: 'User already exist' });
    if (await ExpenseUser.findOne({ email }))
      res.status(400).json({ message: 'Email already exist' });
    const hash = await bcrypt.hash(password, 10);
    const user = new ExpenseUser({ username, email, passwordHash: hash });
    await user.save();
    res.json({ message: 'Registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await ExpenseUser.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '10d' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
module.exports = router;
