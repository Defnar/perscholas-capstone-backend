import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/User.js";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ githubId: profile.id });

        if (existingUser) return done(null, existingUser);

        const newUser = new User({
          githubId: profile.id,
          username: profile.username,
          email: profile.emails[0].value,
        });

        await newUser.save();

        done(null, newUser);
      } catch (err) {
        done(err);
      }
    }
  )
);
