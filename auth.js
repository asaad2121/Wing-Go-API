// Purpose: Configures Google OAuth strategy for Passport.js, handles user authentication/creation in the database.
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const models = require('./models');

// Set up Google OAuth 2.0 strategy for Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            // Attempt to find existing user by Google ID
            try {
                let user = await models.Users.findOne({ where: { googleId: profile?.id } });

                if (!user) {
                    // If not found by Google ID, try finding by email (for users who signed up via email first)
                    const email = profile?.emails[0]?.value;
                    user = await models.Users.findOne({ where: { email } });

                    if (user) {
                        // Link Google ID to existing user account
                        user.googleId = profile?.id;
                        await user.save();
                    } else {
                        // Create new user with Google profile info
                        user = await models.Users.create({
                            firstName: profile?.name?.givenName || 'Google',
                            lastName: profile?.name?.familyName || 'User',
                            email: email,
                            googleId: profile?.id,
                            hashedPassword: '',
                            salt: '',
                        });
                    }
                }

                // Successfully authenticated or created user
                return done(null, user);
            } catch (error) {
                // Handle errors during user lookup/creation
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }
    )
);
