require('dotenv').config();

const express = require('express');
const cors = require('cors');
const MessageService = require('./MessageService');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Twilio setup
const smsService = new MessageService(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN,
  process.env.TWILIO_PHONE
);

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// Store OTPs in memory (for dev/demo only; use Redis or DB for production)
const otpStore = new Map();

// POST /send-message (general use)
app.post('/send-message', async (req, res) => {
  const { to, body } = req.body;

  if (!to || !body) {
    return res.status(400).json({ success: false, error: "Missing 'to' or 'body'." });
  }

  try {
    const result = await smsService.sendSms(to, body);
    res.json({ success: true, sid: result.sid });
  } catch (err) {
    console.error('Error sending SMS:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /send-otp
app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, error: 'Phone number required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await smsService.sendSms(phone, `Your BitePilot verification code is: ${otp}`);
    otpStore.set(phone, { code: otp, createdAt: Date.now() });
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to send OTP:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /verify-otp
app.post('/verify-otp', (req, res) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, error: 'Phone and code required' });
  }

  const record = otpStore.get(phone);
  if (!record) return res.status(400).json({ success: false, error: 'No OTP found for this phone' });

  const isValid = record.code === code && (Date.now() - record.createdAt < 5 * 60 * 1000);
  if (!isValid) return res.status(400).json({ success: false, error: 'Invalid or expired code' });

  otpStore.delete(phone);
  res.json({ success: true, userId: phone });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 BitePilot messaging server running on http://localhost:${PORT}`);
});
