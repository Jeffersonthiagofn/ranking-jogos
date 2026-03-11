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
    appid: Number,
    playtime_forever: Number
  }]
});

export default mongoose.model("User", UserSchema);