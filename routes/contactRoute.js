const express = require('express');
const router = express.Router();
const Contact = require('../models/contactModel');

router.post('/contact', async (req, res) => {
    const { name, email, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        // Create a new contact message
        
        const newContact = new Contact({ name, email, message });
        await newContact.save();
    
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router