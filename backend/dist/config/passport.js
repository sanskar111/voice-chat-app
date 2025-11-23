"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenForUser = exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const configurePassport = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
            const googleId = profile.id;
            const username = profile.displayName || (email === null || email === void 0 ? void 0 : email.split('@')[0]) || 'User';
            const avatar = (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value;
            if (!email) {
                return done(new Error('No email found in Google profile'), undefined);
            }
            // Find or create user
            let user = yield prisma.user.findUnique({
                where: { googleId },
            });
            if (!user) {
                // Check if user exists with this email
                user = yield prisma.user.findUnique({
                    where: { email },
                });
                if (user) {
                    // Link Google account to existing user
                    user = yield prisma.user.update({
                        where: { id: user.id },
                        data: { googleId, avatar },
                    });
                }
                else {
                    // Create new user
                    user = yield prisma.user.create({
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
        }
        catch (error) {
            return done(error, undefined);
        }
    })));
    // JWT Strategy
    const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
    passport_1.default.use(new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    }, (payload, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findUnique({
                where: { id: payload.userId },
            });
            if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        }
        catch (error) {
            return done(error, false);
        }
    })));
};
exports.configurePassport = configurePassport;
const generateTokenForUser = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
};
exports.generateTokenForUser = generateTokenForUser;
