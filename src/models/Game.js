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

  description: { 
    type: String 
  },

  genres: [{
     type: String 
    }],

  developer: { 
    type: String
  },

  release_date: { 
    type: String 
  },
  
  achievements: [{
    name: String,
    description: String,
    icon: String
  }],

  current_players: { 
    type: Number, default: 0 
  },

  all_time_peak: { 
    type: Number, default: 0 
  },

  player_history: [{
    timestamp: { type: Date, default: Date.now },
    player_count: Number
  }],

  is_free: { 
    type: Boolean, 
    default: false 
  },
  price: { 
    type: String, 
    default: 'N/A' 
  },

  ranking_data: {
    positive_votes: {type: Number, default: 0},
    score: {type: Number, default: 0}
  },

  status: {
    type: String,
    enum: ['pending', 'detailed', 'erro'],
    default: 'pending'
  },

  last_updated: { type: Date, default: Date.now }

});

export const Game = mongoose.model("Game", GameSchema);
