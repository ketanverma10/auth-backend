import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateGoogleUser } from "../service/oauthService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;

        if (!email || !firstName || !lastName) {
          return done(
            new Error("Required Google profile information is missing"),
            false,
          );
        }

        const userId = await findOrCreateGoogleUser(
          profile.id,
          email,
          firstName,
          lastName,
        );

        return done(null, userId);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
