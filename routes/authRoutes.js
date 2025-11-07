const express = require('express');
const router = express.Router();
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');

const { adminLogin } = require('../controllers/adminController');

// Student Auth
router.post('/register', register);
router.post('/login', login);

// Admin Auth
router.post('/admin-login', adminLogin);

// Password Reset
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:userId/:token', resetPassword);

module.exports = router;
