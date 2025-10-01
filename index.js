const express = require('express');
const userRouter = require('./routes/users');
const userProfileRouter = require('./routes/user-details');
const hotelRouter = require('./routes/hotels');
const touristPlaceRouter = require('./routes/tourist-place');
const cityRouter = require('./routes/city');
const tripsRouter = require('./routes/trips');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
require('./auth');

const { authenticateToken } = require('./middleware/session-authentication-middleware');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.REACT_APP,
        credentials: true,
    })
);

app.use(passport.initialize());

// User routes (JWT-secured)
app.use('/users', userRouter);
app.use('/user-details', authenticateToken, userProfileRouter);
app.use('/hotel', authenticateToken, hotelRouter);
app.use('/tourist-place', authenticateToken, touristPlaceRouter);
app.use('/city', authenticateToken, cityRouter);
app.use('/trips', authenticateToken, tripsRouter);

app.get('/protected-route', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: 'auth/error' }),
    (req, res) => {
        // req.user contains the Google profile.
        console.log(req?.user);

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            // { googleId: req?.user?.id, email: req?.user?.emails[0]?.value },
            { googleId: req?.user?.googleId, email: req?.user?.email },
            process.env.JWT_SECRET,
            {
                expiresIn: '30m',
            }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 1800000,
            secure: false, // true if using HTTPS (production)
            sameSite: 'Lax',
        });

        res.redirect(process.env.REACT_APP + '/dashboard');
    }
);

app.get('/auth/error', (req, res) => {
    res.send('Google login failed. Check server logs.');
});

// Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Return "https" URLs by setting secure: true
});

const PORT = process.env.PORT || 2139;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
