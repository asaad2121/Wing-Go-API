const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) return res.sendStatus(401).json({ success: false, message: 'Unauthorized' }); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403).json({ success: false, message: 'Invalid token' }); // Token is invalid

        // Check if the token is about to expire (e.g., less than 5 minutes left)
        const expirationTime = user.exp * 1000;
        const currentTime = Date.now();
        const renewalThreshold = 5 * 60 * 1000; // 5 minutes

        if (expirationTime - currentTime < renewalThreshold) {
            const newToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '30m' });
            res.cookie("jwt", newToken, { expire: new Date(Date.now() + 1800000) });
        }

        req.user = user; // Attach user info to request
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = {
    authenticateToken
}