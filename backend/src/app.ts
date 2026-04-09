import express from 'express';
import cors from 'cors';
import authRoutes     from './routes/auth.routes';
import sessionRoutes  from './routes/session.routes';
import zoneRoutes     from './routes/zone.routes';
import alertRoutes    from './routes/alert.routes';
import fishRoutes     from './routes/fish.routes';
import adminRoutes    from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Fishing Regulation System API is running.' });
});

// Auth
app.use('/api/auth',      authRoutes);

// Core
app.use('/api/sessions',  sessionRoutes);
app.use('/api/zones',     zoneRoutes);
app.use('/api/fish',      fishRoutes);
app.use('/api/alerts',    alertRoutes);

// Admin CRUD
app.use('/api/admin',     adminRoutes);

// Research Analytics
app.use('/api/analytics', analyticsRoutes);

export { app };
