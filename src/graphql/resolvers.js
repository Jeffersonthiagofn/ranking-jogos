import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const resolvers = {
  Query: {
    getUser: async (_, { id }) => {
      return await User.findById(id);
    },

    getGames: async (_, { limit = 20, offset = 0 }) => {
      return await Game.find().skip(offset).limit(limit);
    },
  
    getGameAchievements: async (_, { appid }, context) => {
      if (!context.user) throw new Error("Unauthorized");

      const user = await User.findById(context.user.id);
      if (!user.steamId) throw new Error("No Steam account linked!");

      const url = `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${process.env.STEAM_API_KEY}&steamid=${user.steamId}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.playerstats || !data.playerstats.achievements) {
        return [];
      }

      return data.playerstats.achievements.map(ach => ({
        name: ach.apiname,
        description: "Fetched from Steam",
        icon: "", 
        completion_percentage: ach.achieved === 1 ? 100 : 0
      }));
    },
    
  },
  
  OwnedGame: {
      gameDetails: async (parent) => {
        return await Game.findOne({ appid: parent.appid });
      }
    },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const crypt = await bcrypt.compare(password, user.password);
      if (!crypt) {
        throw new Error("Incorrect password");
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { 
        msg: "Login successful!", 
        token: token 
      };
    },

    syncMyLibrary: async (_, __, context) => {
      if (!context.user) throw new Error("Unauthorized");

      const user = await User.findById(context.user.id);
      if (!user.steamId) throw new Error("No Steam account linked!");

      const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${user.steamId}&format=json`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!data.response || !data.response.games) {
        throw new Error("Could not fetch games from Steam");
      }

      user.ownedGames = data.response.games.map(game => ({
        appid: game.appid,
        playtime_forever: game.playtime_forever
      }));

      await user.save();
      
      return "Library synced successfully!";
    },

    register: async (_, { name, email, password }) => {
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error("Email already registered");
      }

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        password: encryptedPassword
      });

      await newUser.save();
      return "User registered successfully!";
    }
  }
};