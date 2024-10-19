const models = require('../models');
const jwt = require("jsonwebtoken");

const loginUsers = async(req, res) => {

    const { email, password } = req.body

    const user = await models.Users.findOne({ where: {email: email}});

    console.log(user.authenticate('123'));

    if (!user) {
        res.status(404).json({ success: false, message: 'User with email does not exist.' });
    }

    if (!user.authenticate(password)) {
        res.status(404).json({ success: false, message: 'Email and password do not match' });
    }
    // const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);
    // res.cookie("t",token,{expire:new Date()+9999});
    res.status(200).json({ success: true, message: 'Login successful', data: user });

    if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};

module.exports = {
    loginUsers,
};