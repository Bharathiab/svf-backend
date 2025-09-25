const express = require('express');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
const router = express.Router();

// Create transporter for email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET /api/contact/
router.get('/', (req, res) => {
  res.send('✅ Backend is running fine on /api/contact');
});

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, location, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !location || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to database
    const contact = new Contact({ name, email, phone, location, message });
    await contact.save();

    // Try to send email (don't fail if email fails)
    try {
      const mailOptions = {
        from: email,
        to: process.env.EMAIL_TO || 'svfworld1@gmail.com',
        subject: `New Contact Enquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nMessage: ${message}`,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue, don't fail the request
    }

    res.status(200).json({ message: 'Enquiry sent successfully!' });
  } catch (error) {
    console.error('Error processing contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
