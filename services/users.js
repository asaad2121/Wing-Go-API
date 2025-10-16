const models = require('../models');
const jwt = require('jsonwebtoken');

// Controller to handle user login requests
// Validates user credentials, generates JWT, and sets authentication cookie
const loginUsers = async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await models.Users.findOne({ where: { email: email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Verify password using user model's authenticate method
    if (!user.authenticate(password))
        return res.status(401).json({ success: false, message: 'Email and password do not match' });

    // Generate JWT token with user ID payload, expires in 30 minutes
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30m' });

    // Set JWT token in httpOnly cookie with security settings based on environment
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    // Respond with success and user data
    res.status(200).json({ success: true, message: 'Login successful', data: user });
};

// Controller to handle user signup requests
// Validates if email already exists, creates new user, and handles errors
const signupUsers = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Check if a user with the same email already exists
    const userExists = await models.Users.findOne({ where: { email } });
    if (userExists) {
        return res.status(403).json({ success: false, message: 'User with the same email already exists' });
    }

    try {
        // Create new user instance and assign password
        const user = new models.Users({
            email,
            firstName,
            lastName,
        });
        user.password = password;

        // Save user to database
        await user.save();

        // Respond with signup success message
        res.status(200).json({ success: true, message: 'Signup Successful' });
    } catch (error) {
        // Log and respond with error details if signup fails
        console.error(error);
        res.status(500).json({ success: false, message: 'Error during signup', error: error.message });
    }
};

module.exports = {
    loginUsers,
    signupUsers,
};
