import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';  
import { updateGameDetails, queueStaleGames, autoIngestIfEmpty } from './services/steamService.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/admin', adminRoutes);

const url = process.env.MONGO_URL;

if (!url) {
  console.error("Error: MONGO_URL is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(url)
  .then(async () => {
    console.log('Successfully connected to MongoDB');
    
    await autoIngestIfEmpty();

    console.log('Server started! Running initial game detail update...');
    updateGameDetails(); 
  })
  .catch((err) => console.error('Database connection error:', err));

cron.schedule('*/2 * * * *', () => {
    console.log('Cron triggered: Fetching the next batch of games...');
    updateGameDetails();
});

cron.schedule('0 3 * * *', () => {
    console.log('Running daily sweep for stale games...');
    queueStaleGames();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is awake and listening on port ${PORT}`);
});