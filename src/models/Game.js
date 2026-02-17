import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  genero: {
    type: String,
    required: true,
  },
  dataLancamento: {
    type: Date,
  },
  desenvolvedor: {
    type: String,
  },
  popularidade: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Game", GameSchema);
