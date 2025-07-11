const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const RequestForExpert = require('../models/RequestForExpert');
const { uploadToGoogleDrive } = require('../services/googleDrive');
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
    let attachmentData = null;
    if (req.file) {
      attachmentData = await uploadToGoogleDrive(req.file);
    }
    const newRequest = new RequestForExpert({
      name,
      mobile,
      email,
      institute,
      date,
      time,
      domains: Array.isArray(domains) ? domains : [domains],
      attachment: attachmentData ? attachmentData.webViewLink : null,
      attachmentId: attachmentData ? attachmentData.fileId : null,
      description
    });
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requestforexperts
router.get('/', async (req, res) => {
  try {
    const requests = await RequestForExpert.find({}, 'name email mobile domains institute date time description assignedExpert assignedExperts').sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/requestforexperts/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Convert domains string to array if it's a string
    if (typeof updateData.domains === 'string') {
      updateData.domains = updateData.domains.split(',').map(d => d.trim()).filter(d => d);
    }
    
    const updatedRequest = await RequestForExpert.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
