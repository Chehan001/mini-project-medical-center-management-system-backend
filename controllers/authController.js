const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const PasswordReset = require('../models/passwordReset');
const transporter = require('../utils/emailTransporter');

const validDomains = ['@std.geo.sab.ac.lk', '@std.appsc.sab.ac.lk'];

// Student_Register
exports.register = async (req, res) => {
  try {
    let { university_mail, university_reg_number, password } = req.body;

    if (!university_mail || !university_reg_number || !password)
      return res.status(400).json({ message: 'All fields are required' });

    university_mail = university_mail.toLowerCase();
    university_reg_number = university_reg_number.toUpperCase();

    const isValidDomain = validDomains.some((d) => university_mail.endsWith(d));
    if (!isValidDomain)
      return res.status(400).json({ message: 'Please use a valid university email address' });

    const existingUser = await User.findOne({
      $or: [{ university_mail }, { university_reg_number }],
    });
    if (existingUser)
      return res.status(400).json({ message: 'User already registered' });

    const newUser = new User({
      university_mail,
      university_reg_number,
      password,
      role: 'student',
    });

    await newUser.save();
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Student_Login 
exports.login = async (req, res) => {
  try {
    let { university_reg_number, password } = req.body;
    if (!university_reg_number || !password)
      return res.status(400).json({ message: 'Register number and password required' });

    university_reg_number = university_reg_number.toUpperCase();
    const user = await User.findOne({ university_reg_number });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mysecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Password_Reset_Request
exports.requestPasswordReset = async (req, res) => {
  try {
    let { university_mail } = req.body;
    if (!university_mail)
      return res.status(400).json({ message: 'Email is required' });

    university_mail = university_mail.toLowerCase();
    const user = await User.findOne({ university_mail });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    await PasswordReset.deleteMany({ userId: user._id });
    await new PasswordReset({ userId: user._id, token }).save();

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${user._id}/${token}`;

    await transporter.sendMail({
      from: `"University Medical Center" <${process.env.EMAIL_USER}>`,
      to: university_mail,
      subject: 'Password Reset Request',
      text: `Click this link to reset your password: ${resetLink}`,
    });

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword)
      return res.status(400).json({ message: 'All fields required' });
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const resetDoc = await PasswordReset.findOne({ userId, token });
    if (!resetDoc)
      return res.status(400).json({ message: 'Invalid or expired reset token' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    await PasswordReset.deleteMany({ userId });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};