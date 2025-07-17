const models = require('../models');

const getUserData = async (req, res) => {
    const email = req?.query?.email;

    if (!email || email?.trim() === '') {
        return res.status(400).json({ success: false, error: [{ msg: 'Email cannot be empty' }] });
    }

    const user = await models.Users?.findOne({ where: { email: email } });
    if (!user)
        return res.status(500).json({ success: false, message: 'Unable to fetch information, please try again!' });

    res.status(200).json({ success: true, message: 'User information available', data: user });
};

module.exports = {
    getUserData,
};
