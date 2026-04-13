import User from "../models/User.js";
import { Game } from "../models/Game.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const resolvers = {
    Game: {
        thumb: (parent) => {
            return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${parent.appid}/header.jpg`;
        },
        icon: (parent) => {
            return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${parent.appid}/capsule_231x87.jpg`;
        },
        cover: (parent) => {
            return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${parent.appid}/library_600x900.jpg`;
        },
        popularityScore: (parent) => {
            if (parent.popularityScore != null) {
                return parent.popularityScore;
            }

            const score = parent.ranking_data?.score || 0;
            const votes = parent.ranking_data?.positive_votes || 0;

            return score * Math.log10(votes + 1);
        },
    },

    OwnedGame: {
        gameDetails: async (parent) => {
            return await Game.findOne({ appid: parent.appid });
        },
    },

    Favorite: {
        gameDetails: async (parent) => {
            return await Game.findOne({ appid: parent.appid });
        },
    },

    Query: {
        getUser: async (_, { id }) => {
            return await User.findById(id);
        },

        getMe: async (_, __, context) => {
            if (!context.user) {
                throw new Error("Not verified");
            }

            const currentUser = await User.findById(context.user.id);

            if (!currentUser) {
                throw new Error("User not found");
            }

            return currentUser;
        },

        getGames: async (_, { limit = 20, offset = 0 }) => {
            return await Game.find().skip(offset).limit(limit);
        },

        getGameByAppId: async (_, { appid }) => {
            return Game.findOne({ appid });
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

            return data.playerstats.achievements.map((ach) => ({
                name: ach.apiname,
                description: "Fetched from Steam",
                icon: "",
                completion_percentage: ach.achieved === 1 ? 100 : 0,
            }));
        },

        getGamesCount: async () => {
            return Game.countDocuments();
        },

        getTotalActivePlayers: async () => {
            const result = await Game.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$current_players" },
                    },
                },
            ]);

            return result[0]?.total || 0;
        },

        getGenres: async () => {
            const genres = await Game.aggregate([
                { $unwind: "$genres" },
                { $group: { _id: "$genres" } },
                { $sort: { _id: 1 } },
            ]);

            return genres.map((g) => g._id);
        },

        getMostPopularGames: async (_, { limit = 5 }) => {
            return await Game.aggregate([
                {
                    $addFields: {
                        popularityScore: {
                            $multiply: [
                                { $ifNull: ["$ranking_data.score", 0] },
                                {
                                    $log10: {
                                        $add: [{ $ifNull: ["$ranking_data.positive_votes", 0] }, 1],
                                    },
                                },
                            ],
                        },
                    },
                },
                { $sort: { popularityScore: -1 } },
                { $limit: limit },
            ]);
        },

        getMyTopGames: async (_, __, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const user = await User.findById(context.user.id);

            if (!user || !user.ownedGames) return [];

            const sortedGames = user.ownedGames.sort(
                (a, b) => b.playtime_forever - a.playtime_forever,
            );

            const appIds = sortedGames.map((g) => g.appid);

            const games = await Game.find({ appid: { $in: appIds } });

            const gamesMap = new Map(games.map((g) => [g.appid, g]));

            const result = sortedGames
                .map((g) => {
                    const gameDetails = gamesMap.get(g.appid);

                    if (!gameDetails) return null;

                    return {
                        ...gameDetails.toObject(),
                        playtime_forever: g.playtime_forever,
                    };
                })
                .filter(Boolean);

            return result;
        },

        searchGames: async (_, { query }) => {
            return Game.find({
                name: { $regex: query, $options: "i" },
            }).limit(4);
        },

        getGamesFiltered: async (_, { genre, sort = "popular", limit = 10, offset = 0 }) => {
            let matchStage = {};

            if (genre) {
                matchStage.genres = genre;
            }

            let basePipeline = [{ $match: matchStage }];

            basePipeline.push({
                $addFields: {
                    popularityScore: {
                        $multiply: [
                            { $ifNull: ["$ranking_data.score", 0] },
                            {
                                $log10: {
                                    $add: [{ $ifNull: ["$ranking_data.positive_votes", 0] }, 1],
                                },
                            },
                        ],
                    },
                    parsedDate: {
                        $dateFromString: {
                            dateString: "$release_date",
                            format: "%d %b, %Y",
                            onError: null,
                        },
                    },
                },
            });

            let sortStage = {};

            switch (sort) {
                case "players":
                    sortStage = { current_players: -1 };
                    break;

                case "release":
                    sortStage = { parsedDate: -1 };
                    break;

                case "price_desc":
                    basePipeline.push({ $match: { numericPrice: { $ne: null } } });
                    sortStage = { numericPrice: -1 };
                    break;

                case "price_asc":
                    basePipeline.push({ $match: { numericPrice: { $ne: null } } });
                    sortStage = { numericPrice: 1 };
                    break;

                default:
                    sortStage = { popularityScore: -1 };
            }

            const totalResult = await Game.aggregate([...basePipeline, { $count: "total" }]);

            const total = totalResult[0]?.total || 0;

            const games = await Game.aggregate([
                ...basePipeline,
                { $sort: sortStage },
                { $skip: offset },
                { $limit: limit },
            ]);

            return {
                games,
                total,
            };
        },
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
                token: token,
            };
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
                password: encryptedPassword,
            });

            await newUser.save();
            return "User registered successfully!";
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

            let ownedGames = gamesData.response.games.map((game) => ({
                appid: game.appid,
                playtime_forever: game.playtime_forever,
                completed_achievements: 0,
                total_achievements: 0,
                unlocked_achievements: [],
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
                        achData.response.games.forEach((achGame) => {
                            const targetGame = ownedGames.find((g) => g.appid === achGame.appid);
                            if (targetGame) {
                                targetGame.total_achievements = achGame.total_achievements || 0;

                                if (achGame.achievements) {
                                    targetGame.completed_achievements = achGame.achievements.length;
                                    targetGame.unlocked_achievements = achGame.achievements.map(
                                        (ach) => ach.name,
                                    );
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
        toggleFavorite: async (_, { appid }, context) => {
            if (!context.user) throw new Error("Unauthorized");

            const user = await User.findById(context.user.id);

            const exists = user.favorites.find((fav) => fav.appid === appid);

            if (exists) {
                user.favorites = user.favorites.filter((fav) => fav.appid !== appid);
            } else {
                user.favorites.push({ appid });
            }

            await user.save();

            return user.favorites;
        },
    },
};
