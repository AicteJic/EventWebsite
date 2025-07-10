const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/messages - Create a new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const newMessage = new Message({ name, email, subject, message, phone });
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// GET /api/messages - Get all messages (admin only)
router.get('/', async (req, res) => {
  try {
    // Optionally, add admin authentication middleware here
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// PATCH /api/messages/:id/reply - Add or update a reply to a message
router.patch('/:id/reply', async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { reply },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found.' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reply.' });
  }
});

module.exports = router; 
