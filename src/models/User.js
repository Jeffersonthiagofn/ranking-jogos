import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true
  },
  
  password: {
    type: String,
    required: true,
  },
  
  steamId: { 
    type: String, 
    required: false,
    unique: true, 
    sparse: true 
  },
  
  displayName: String,
  
  avatar: String,
  
  ownedGames: [{
    appid: { type: Number, required: true },
    playtime_forever: { type: Number, default: 0 },
    completed_achievements: { type: Number, default: 0 },
    total_achievements: { type: Number, default: 0 },
    unlocked_achievements: [{ type: String }]
  }]
});

export default mongoose.model("User", UserSchema);