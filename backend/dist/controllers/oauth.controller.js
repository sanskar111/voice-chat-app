"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = void 0;
const passport_1 = require("../config/passport");
const googleCallback = (req, res) => {
    console.log('=== OAUTH CALLBACK START ===');
    console.log('User from Passport:', req.user ? 'Present' : 'Missing');
    try {
        if (!req.user) {
            console.error('No user in request');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const redirectUrl = `${frontendUrl}/login?error=auth_failed`;
            console.log('Redirecting to (auth failed):', redirectUrl);
            return res.redirect(redirectUrl);
        }
        // Generate JWT token
        const token = (0, passport_1.generateTokenForUser)(req.user);
        console.log('Generated token length:', token.length);
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const callbackUrl = `${frontendUrl}/auth/callback?token=${token}`;
        console.log('Redirecting to (success):', callbackUrl);
        console.log('=== OAUTH CALLBACK END ===');
        res.redirect(callbackUrl);
    }
    catch (error) {
        console.error('Google OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const errorUrl = `${frontendUrl}/login?error=server_error`;
        console.log('Redirecting to (error):', errorUrl);
        res.redirect(errorUrl);
    }
};
exports.googleCallback = googleCallback;
