import { Router } from 'express';
import passport from 'passport';
import { googleCallback } from '../controllers/oauth.controller';

const router = Router();

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
    }),
    googleCallback
);

export default router;
