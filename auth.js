const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const models = require('./models');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await models.Users.findOne({ where: { googleId: profile?.id } });

                if (!user) {
                    const email = profile?.emails[0]?.value;
                    user = await models.Users.findOne({ where: { email } });

                    if (user) {
                        user.googleId = profile?.id;
                        await user.save();
                    } else {
                        // Create new user
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

                return done(null, user);
            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }
    )
);
