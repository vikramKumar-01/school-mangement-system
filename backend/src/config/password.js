import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(
    new GoogleStrategy(
        {
            clientID:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:  process.env.GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                // Check if user already exists with this google email
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Existing user — just return them
                    return done(null, user);
                }

                // New user — create without password (Google users don't need one)
                user = await User.create({
                    fullName:     profile.displayName,
                    email:        profile.emails[0].value,
                    profileImage: profile.photos[0]?.value || "",
                    password:     `GOOGLE_OAUTH_${profile.id}`, // dummy — never used for login
                    role:         "student",
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Only needed if using sessions (we're using JWT so these are minimal)
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select("-password -refreshToken");
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;