import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const googleId = profile.id;
                    const username = profile.displayName || email?.split('@')[0] || 'User';
                    const avatar = profile.photos?.[0]?.value;

                    if (!email) {
                        return done(new Error('No email found in Google profile'), undefined);
                    }

                    // Find or create user
                    let user = await prisma.user.findUnique({
                        where: { googleId },
                    });

                    if (!user) {
                        // Check if user exists with this email
                        user = await prisma.user.findUnique({
                            where: { email },
                        });

                        if (user) {
                            // Link Google account to existing user
                            user = await prisma.user.update({
                                where: { id: user.id },
                                data: { googleId, avatar },
                            });
                        } else {
                            // Create new user
                            user = await prisma.user.create({
                                data: {
                                    email,
                                    username,
                                    googleId,
                                    avatar,
                                    password: null, // No password for Google auth
                                },
                            });
                        }
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );
};

export const generateTokenForUser = (user: any) => {
    return jwt.sign(
        { userId: user.id, email: user.email, username: user.username },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    );
};
