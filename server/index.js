// server/index.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import testDriveRoute from './routes/testDriveRoute.js';
import inventoryRoute from './routes/inventoryRoute.js';
import uploadRoute from './routes/uploadRoute.js';
import conciergeSessionRoute from './routes/conciergeSessionRoute.js';
import agentMessageRoute from './routes/agentMessageRoute.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5050;

// Simple CORS setup for production
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://onetouchauto.onrender.com',
      process.env.CLIENT_URL
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/test-drive', testDriveRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/uploads', uploadRoute);
app.use('/api/concierge', conciergeSessionRoute); 
app.use('/api/agent', agentMessageRoute);



app.use('/uploads', express.static(join(__dirname, 'uploads')));


if (process.env.NODE_ENV === 'production') {
  const clientDistPath = join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDistPath, 'index.html'));
  });
}


app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
