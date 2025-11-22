import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

app.get('/', (req, res) => {
    res.send('Voice Chat API is running');
});

export default app;
