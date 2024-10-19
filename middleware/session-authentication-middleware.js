const jwt = require('jsonwebtoken');

const userAuthenticationMiddleware = (req, res, next) => {
    const token = req.cookies['jwt'];
    const secret = process.env.JWT_SECRET;
    jwt.verify(token, secret, async (err, decoded) => {
        if (!err) {
            req.meta = decoded;
            next();
        } else {
            res.status(401).json({ success: false, message: 'Unauthorized' });
        }
    });
};

module.exports = {
    userAuthenticationMiddleware
}