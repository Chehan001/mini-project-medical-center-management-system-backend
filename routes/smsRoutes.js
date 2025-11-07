const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/send', async (req, res) => {
  try {
    const { studentNumber, phoneNumber, appointmentDate } = req.body;

    if (!phoneNumber || !appointmentDate) {
      return res.status(400).json({ message: 'Phone number and appointment date are required' });
    }

    const message = await client.messages.create({
      body: `Hello! Your appointment is confirmed for ${appointmentDate}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.json({ ok: true, sid: message.sid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
});

module.exports = router;
