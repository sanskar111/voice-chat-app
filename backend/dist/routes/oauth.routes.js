"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const oauth_controller_1 = require("../controllers/oauth.controller");
const router = (0, express_1.Router)();
// Initiate Google OAuth
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
// Google OAuth callback
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`
}), oauth_controller_1.googleCallback);
exports.default = router;
