import { Request, Response } from 'express';
import { generateTokenForUser } from '../config/passport';

export const googleCallback = (req: Request, res: Response) => {
    try {
        if (!req.user) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/login?error=auth_failed`);
        }

        // Generate JWT token
        const token = generateTokenForUser(req.user);

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=server_error`);
    }
};
