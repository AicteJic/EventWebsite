const express = require('express');
const { check } = require('express-validator');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Add at the top if not already present
const { v4: uuidv4 } = require('uuid'); // Add at the top if not already present
const crypto = require('crypto');
const nodemailer = require('nodemailer'); // Placeholder, configure as needed

const router = express.Router();
// const token = user.getSignedJwtToken();

// Validation middleware
const signupValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

// Routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);

// Route to toggle userType between 'normal' and 'service_provider'
router.put('/users/:id/toggle-usertype', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle userType
    user.userType = user.userType === 'normal' ? 'service_provider' : 'normal';
    await user.save();

    res.status(200).json({ message: 'User type updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch users based on their userType (normal or expert)
router.get('/users', async (req, res) => {
  try {
    const userType = req.query.userType;
    const users = await User.find({ userType }).select('name mobileNumber email');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Route to fetch all users
router.get('/allusers', async (req, res) => {
  try {
    const users = await User.find().select('name email mobileNumber userType');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Route to fetch user details by userId
router.get('/user-details/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('GET /user-details/:userId - Fetching user:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User details fetched successfully:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to update user details by userId (do not require password, only update if provided)
router.put('/user-details/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = { ...req.body };
    if (updates.password) {
      if (updates.password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password; // Don't update password if not provided
    }
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('name email mobileNumber address gender organization role locationOfWork dateOfBirth linkedinProfile userType Domain');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new user (admin add expert)
router.post('/user-details', async (req, res) => {
  try {
    const {
      name,
      email,
      password, // optional for admin
      mobileNumber,
      address,
      gender,
      organization,
      role,
      locationOfWork,
      dateOfBirth,
      linkedinProfile,
      userType = 'domain_expert',
      Domain
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // If no password provided, set a random one (unusable, admin can reset later)
    let finalPassword = password;
    if (!finalPassword || finalPassword.length < 6) {
      finalPassword = uuidv4(); // random string
    }
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      address,
      gender,
      organization,
      role,
      locationOfWork,
      dateOfBirth,
      linkedinProfile,
      userType,
      Domain
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to handle domain expert application
router.post('/apply-domain-expert', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated and user ID is available

    const updates = {
      mobileNumber: req.body.mobileNumber,
      gender: req.body.gender,
      photo: req.body.photo,
      organization: req.body.organization,
      role: req.body.role,
      locationOfWork: req.body.locationOfWork,
      dateOfBirth: req.body.dateOfBirth,
      linkedinProfile: req.body.linkedinProfile,
      domain: req.body.domain,
      cv: req.file ? req.file.path : undefined, // Assuming file upload middleware is used
    };

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Application submitted successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: POST /forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user with that email' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await user.save();

    // Send email (placeholder logic)
    // Configure your transporter with real credentials
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to set a new password: ${resetUrl}`
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route: POST /reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
