import express from 'express';
import mongoose from 'mongoose';
import cron from 'node-cron';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers.js';
import adminRoutes from './routes/adminRoutes.js';  
import { updateGameDetails, queueStaleGames, autoIngestIfEmpty } from './services/steamService.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/admin', adminRoutes);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const url = process.env.MONGO_URL;

if (!url) {
  console.error("Error: MONGO_URL is not defined in the environment variables.");
  process.exit(1);
}
mongoose.connect(url)
  .then(async () => {
    console.log('Successfully connected to MongoDB');

    // Iniciao motor do Apollo
    await server.start();

    // Conecta o GraphQL na rota /graphql 🔌
    app.use('/graphql', expressMiddleware(server));
    console.log('GraphQL is ready at /graphql');
    
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