const mongoose = require('mongoose');

const requestForExpertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  institute: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  domains: [{ type: String, required: true }],
  attachment: { type: String }, // filename if uploaded
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('RequestForExpert', requestForExpertSchema); 
