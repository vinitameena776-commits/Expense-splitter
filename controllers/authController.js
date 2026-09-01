const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/apiResponse');

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return sendResponse(res, 400, 'Name is required');
    }
    if (!email || !email.includes('@')) {
      return sendResponse(res, 400, 'Valid email is required');
    }
    if (!password || password.length < 6) {
      return sendResponse(res, 400, 
        'Password must be at least 6 characters');
    }

    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });
    if (existingUser) {
      return sendResponse(res, 400, 
        'User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword
    });

    sendResponse(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, 
        'Email and password are required');
    }

    const user = await User.findOne({ 
      email: email.toLowerCase() 
    });
    if (!user) {
      return sendResponse(res, 400, 
        'Invalid email or password');
    }

    const isPasswordCorrect = await bcrypt.compare(
      password, 
      user.password
    );
    if (!isPasswordCorrect) {
      return sendResponse(res, 400, 
        'Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, 'Email is required');
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return sendResponse(res, 404, 'No user found with this email');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl =
      `https://expense-splitter-ccis.onrender.com/reset-password.html?token=${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Expense Splitter - Password Reset',
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset it:</p>

        <a href="${resetUrl}"
           style="
             display:inline-block;
             padding:12px 20px;
             background:#4f46e5;
             color:white;
             text-decoration:none;
             border-radius:6px;
           ">
          Reset Password
        </a>

        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `
    });

    sendResponse(
      res,
      200,
      'Password reset link sent to your email'
    );

  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);
    sendResponse(res, 500, 'Unable to send reset email');
  }
};


// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return sendResponse(
        res,
        400,
        'Password must be at least 6 characters'
      );
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return sendResponse(
        res,
        400,
        'Invalid or expired reset token'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    sendResponse(
      res,
      200,
      'Password reset successfully'
    );

  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);
    sendResponse(res, 500, 'Unable to reset password');
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword
};