const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/apiResponse');

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

module.exports = { register, login };