const models = require('../models');
const jwt = require('jsonwebtoken');

const loginUsers = async (req, res) => {
    const { email, password } = req.body;
    const user = await models.Users.findOne({ where: { email: email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.authenticate(password))
        return res.status(404).json({ success: false, message: 'Email and password do not match' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.ENVIRONMENT === 'prod' ? 'None' : 'Lax',
    });

    res.status(200).json({ success: true, message: 'Login successful', data: user });
};

const signupUsers = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const userExists = await models.Users.findOne({ where: { email } });
    if (userExists) {
        return res.status(403).json({ success: false, message: 'User with the same email already exists' });
    }

    try {
        const user = new models.Users({
            email,
            firstName,
            lastName,
        });
        user.password = password;
        await user.save();

        res.status(200).json({ success: true, message: 'Signup Successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error during signup', error: error.message });
    }
};

module.exports = {
    loginUsers,
    signupUsers,
};
