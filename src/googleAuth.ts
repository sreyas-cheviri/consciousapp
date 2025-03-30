import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from './db';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { random } from './utils';
import bcrypt from 'bcrypt';

// Configure Passport.js with Google Strategy
export const setupGoogleAuth = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
        passReqToCallback: true
        // Remove prompt and accessType from here - they don't belong in the strategy config
      },
      async (_req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists in our database
          let user = await UserModel.findOne({ googleId: profile.id });
          let isNewAccount = false;
          
          if (!user) {
            isNewAccount = true;
            // If user doesn't exist, create a new one
            // Generate a random password for Google users (they won't use it)
            const randomPassword = await bcrypt.hash(random(12), 10);
            
            // Create username from email or Google ID
            const username = profile.emails && profile.emails[0]?.value 
              ? profile.emails[0].value.split('@')[0] 
              : `google_user_${profile.id}`;
            
            // Check if username already exists
            const existingUsername = await UserModel.findOne({ username });
            const finalUsername = existingUsername 
              ? `${username}_${random(4)}` 
              : username;
            
            // Create a new user with Google profile info
            user = await UserModel.create({
              username: finalUsername,
              googleId: profile.id,
              password: randomPassword, // Store a hashed random password
              email: profile.emails?.[0]?.value || '',
              displayName: profile.displayName || '',
              profilePicture: profile.photos?.[0]?.value || ''
            });
          }
          
          // Create a plain object with user data and add isNewAccount flag
          const userForAuth = {
            _id: user._id,
            username: user.username,
            email: user.email,
            googleId: user.googleId,
            isNewAccount: isNewAccount
          };
          
          return done(null, userForAuth);
        } catch (error) {
          console.error('Google auth error:', error);
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
};

// Generate JWT token for Google authenticated users
export const generateTokenForGoogleUser = (userId: mongoose.Types.ObjectId): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    { expiresIn: '7days' }
  );
};