// Import the necessary modules
const express = require('express');
const router = express.Router();

// Import the loginUsers service function
const { loginUsers } = require('../services/users');

// Define the login route
router.post('/login', (req, res) => {
    // Call the loginUsers service function
    const result = loginUsers(req.body.email, req.body.password);

    // Handle the result and send the response
    if (result.success) {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
