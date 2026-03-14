import User from '../models/User.js';
import { Game } from '../models/Game.js';
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

  Game: {
      thumb: (parent) => {
        return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${parent.appid}/header.jpg`;
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

      const gamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${user.steamId}&format=json`;
      const gamesRes = await fetch(gamesUrl);
      const gamesData = await gamesRes.json();

      if (!gamesData.response || !gamesData.response.games) {
        throw new Error("Could not fetch games from Steam");
      }

      let ownedGames = gamesData.response.games.map(game => ({
        appid: game.appid,
        playtime_forever: game.playtime_forever,
        completed_achievements: 0,
        total_achievements: 0,
        unlocked_achievements: []
      }));

      const chunkSize = 50;
      
      for (let i = 0; i < ownedGames.length; i += chunkSize) {
        const chunk = ownedGames.slice(i, i + chunkSize);
        
        let achUrl = `https://api.steampowered.com/IPlayerService/GetTopAchievementsForGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${user.steamId}&max_achievements=10000`;
        
        chunk.forEach((game, index) => {
          achUrl += `&appids[${index}]=${game.appid}`;
        });

        try {
          const achRes = await fetch(achUrl);
          const achData = await achRes.json();

          if (achData.response && achData.response.games) {
            achData.response.games.forEach(achGame => {
              const targetGame = ownedGames.find(g => g.appid === achGame.appid);
              if (targetGame) {
                targetGame.total_achievements = achGame.total_achievements || 0;
                
                if (achGame.achievements) {
                  targetGame.completed_achievements = achGame.achievements.length;
                  targetGame.unlocked_achievements = achGame.achievements.map(ach => ach.name);

                } else {
                  targetGame.completed_achievements = 0;
                  targetGame.unlocked_achievements = [];
                }
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching achievement chunk starting at index ${i}:`, err);
        }
      }

      user.ownedGames = ownedGames;
      await user.save();
      
      return "Library and achievement stats synced successfully!";
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