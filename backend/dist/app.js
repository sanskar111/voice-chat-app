"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const oauth_routes_1 = __importDefault(require("./routes/oauth.routes"));
const passport_2 = require("./config/passport");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
//Configure Passport
(0, passport_2.configurePassport)();
app.use('/auth', auth_routes_1.default);
app.use('/auth', oauth_routes_1.default);
app.use('/rooms', room_routes_1.default);
app.get('/', (req, res) => {
    res.send('Voice Chat API is running');
});
exports.default = app;
