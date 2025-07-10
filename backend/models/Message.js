const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required:true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String, default: '' },
  attachments: [
    {
      filename: String,
      originalname: String,
      mimetype: String,
      path: String,
      size: Number
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema); 
