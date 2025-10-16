// Import database models
const models = require('../models');

/**
 * Fetch user information based on email query param.
 * Validates input, queries the Users table, and sends appropriate response.
 */
const getUserData = async (req, res) => {
    // Extract email from query parameters
    const email = req.query.email;

    // Validate: Email must not be empty
    if (!email || email?.trim() === '') {
        return res.status(400).json({ success: false, error: [{ msg: 'Email cannot be empty' }] });
    }

    // Query database for user by email
    const user = await models.Users?.findOne({ where: { email: email } });
    // Handle case: user not found
    if (!user)
        return res.status(500).json({ success: false, message: 'Unable to fetch information, please try again!' });

    // Success: return user data
    res.status(200).json({ success: true, message: 'User information available', data: user });
};

module.exports = {
    getUserData,
};
