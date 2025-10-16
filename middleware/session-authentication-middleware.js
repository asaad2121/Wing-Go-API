const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens stored in cookies for session management
const authenticateToken = (req, res, next) => {
    // Retrieve the JWT token from the 'jwt' cookie
    const token = req.cookies.jwt;

    // If no token is found, respond with 401 Unauthorized
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // If token is invalid or expired, respond with 403 Forbidden
        if (err) return res.status(403).json({ success: false, message: 'Invalid token' });

        // Calculate token expiration time in milliseconds
        const expirationTime = user.exp * 1000;
        const currentTime = Date.now();

        // Define threshold (5 minutes) before token expiration to trigger renewal
        const renewalThreshold = 5 * 60 * 1000; // 5 minutes

        // If token is about to expire within the threshold, issue a new token
        if (expirationTime - currentTime < renewalThreshold) {
            // Create a new token with a fresh 30-minute expiration
            const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30m' });

            // Set the new token in the cookie with appropriate security settings:
            // - httpOnly: prevents client-side JS access for security
            // - maxAge: matches the token expiration (30 minutes)
            // - secure: true in production to ensure cookie is sent over HTTPS only
            // - sameSite: 'None' in production to allow cross-site cookies, 'Lax' otherwise
            res.cookie('jwt', newToken, {
                httpOnly: true,
                maxAge: 30 * 60 * 1000,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            });
        }

        // Attach the decoded user information to the request object for downstream use
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    });
};

module.exports = {
    authenticateToken,
};
