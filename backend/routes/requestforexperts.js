const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const RequestForExpert = require('../models/RequestForExpert');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST /api/requestforexperts
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { name, mobile, email, institute, date, time, domains, description } = req.body;
    const attachment = req.file ? req.file.filename : null;
    const newRequest = new RequestForExpert({
      name,
      mobile,
      email,
      institute,
      date,
      time,
      domains: Array.isArray(domains) ? domains : [domains],
      attachment,
      description
    });
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requestforexperts
router.get('/', async (req, res) => {
  try {
    const requests = await RequestForExpert.find({}, 'name email mobile domains').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
