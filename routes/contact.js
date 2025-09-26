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

    let dbSaved = false;
    if (process.env.MONGO_URI) {
      try {
        const contact = new Contact({ name, email, phone, location, message });
        await contact.save();
        dbSaved = true;
        console.log('Contact saved to database...');
      } catch (dbError) {
        console.error('Database save failed:', dbError);
        // Continue without failing the request
      }
    } else {
      console.log('No MONGO_URI, skipping database save');
    }

    // Try to send email (don't fail if email fails)
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const mailOptions = {
          from: email,
          to: process.env.EMAIL_TO || 'svfworld1@gmail.com',
          subject: `New Contact Enquiry from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nMessage: ${message}`,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue, don't fail the request
      }
    } else {
      console.log('No email credentials, skipping email send');
    }

    // Respond based on what succeeded
    if (dbSaved || emailSent) {
      res.status(200).json({ message: 'Enquiry received successfully!' });
    } else {
      res.status(200).json({ message: 'Enquiry received, but no storage/email configured.' });
    }
  } catch (error) {
    console.error('Error processing contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
