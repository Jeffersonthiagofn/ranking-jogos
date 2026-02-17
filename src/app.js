import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const app = express();

// 1. Configurar para ler JSON
app.use(express.json());

// 2. Definir as rotas
app.use('/api/auth', authRoutes);

// Rota de teste simples
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Conexão com o Banco de Dados
mongoose.connect('mongodb+srv://adm:12345@rankingjogos.kjqlke7.mongodb.net/?appName=RankingJogos')
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});