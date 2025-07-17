const express = require('express');
const userRouter = require('./routes/users');
const userProfileRouter = require('./routes/user-details');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
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

app.get('/protected-route', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
        // req.user contains the Google profile.
        console.log(req?.user);

        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { googleId: req?.user?.id, email: req?.user?.emails[0]?.value },
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

app.listen(2139, () => {
    console.log('Server is running on port 2139');
});
