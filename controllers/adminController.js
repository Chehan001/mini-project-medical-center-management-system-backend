const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const HomeContent = require('../models/homeContentModel');

// Admin_Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ university_mail: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admins only.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'mysecretkey', {
      expiresIn: '1d',
    });

    res.json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get_all_non-admin_users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update_user
const updateUser = async (req, res) => {
  try {
    if (req.body.password) delete req.body.password;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Home_Conten_ management
const addHomeContent = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const newContent = new HomeContent({ title, description, imageUrl });
    await newContent.save();
    res.json({ message: 'Content added', content: newContent });
  } catch (err) {
    console.error('Add home content error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getHomeContent = async (req, res) => {
  try {
    const content = await HomeContent.find();
    res.json(content);
  } catch (err) {
    console.error('Get home content error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteHomeContent = async (req, res) => {
  try {
    const deleted = await HomeContent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted' });
  } catch (err) {
    console.error('Delete home content error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  adminLogin,
  getAllUsers,
  updateUser,
  addHomeContent,
  getHomeContent,
  deleteHomeContent,
};
