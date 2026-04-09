import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import sessionRoutes from './routes/session.routes';
import zoneRoutes from './routes/zone.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Fishing Regulation System API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/zones', zoneRoutes);

export { app };
