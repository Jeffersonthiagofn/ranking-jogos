import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// 1. Configurar para ler JSON
app.use(express.json());

// 2. Definir as rotas
app.use('/api/auth', authRoutes);

// Conection with the data base
const url = process.env.MONGO_URL;

// Stop the app if the database URL is missing
if (!url) {
  console.error("Error: MONGO_URL is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(url)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('Database connection error:', err));

app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is awake and listening on port ${PORT}`);
});