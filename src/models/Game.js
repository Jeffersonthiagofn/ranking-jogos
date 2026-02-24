import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
  appid: {
    type: Number,
    required: true,
    unique: true
  },
  
  name: {
    type: String,
    required: true
  },

  thumbnail: {
    type: String
  },

  status: {
    type: String,
    enum: ['pending', 'detailed', 'erro'],
    default: 'pending'
  },

  ranking_data: {
    positive_votes: {type: Number, default: 0},
    score: {type: Number, default: 0}
  }
});

export const Game = mongoose.model("Game", GameSchema);
