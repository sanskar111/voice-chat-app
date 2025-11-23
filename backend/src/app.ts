import express from 'express';
import cors from 'cors';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import oauthRoutes from './routes/oauth.routes';
import { configurePassport } from './config/passport';

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

//Configure Passport
configurePassport();

app.use('/auth', authRoutes);
app.use('/auth', oauthRoutes);
app.use('/rooms', roomRoutes);

app.get('/', (req, res) => {
    res.send('Voice Chat API is running');
});

export default app;
