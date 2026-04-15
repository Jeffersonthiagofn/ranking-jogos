import express from "express";
import passport from "passport";
import SteamStrategy from "passport-steam";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const fetchSteamLevelData = async (steamId) => {
    try {
        const url = `http://api.steampowered.com/IPlayerService/GetBadges/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&language=${process.env.STEAM_LANG}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.response && data.response.player_level !== undefined) {
            return {
                level: data.response.player_level,
                xp: data.response.player_xp || 0,
                xpNeeded: data.response.player_xp_needed_to_level_up || 0
            };
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch level for SteamID ${steamId}:`, error);
        return null;
    }
};

const checkSyncCooldown = (user, forceSync) => {
    const COOLDOWN_MS = 60 * 60 * 1000;
    
    if (!forceSync && user.lastSyncedAt && (Date.now() - user.lastSyncedAt.getTime() < COOLDOWN_MS)) {
        return true;
    }
    return false;
};

const fetchOwnedGames = async (steamId) => {
    const gamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&format=json&language=${process.env.STEAM_LANG || 'english'}&include_played_free_games=1&include_appinfo=1`;
    const gamesRes = await fetch(gamesUrl);
    const gamesData = await gamesRes.json();

    if (!gamesData.response || !gamesData.response.games) {
        throw new Error("Could not fetch games from Steam.");
    }

    return gamesData.response.games.map((game) => ({
        appid: game.appid,
        playtime_forever: game.playtime_forever,
        completed_achievements: 0,
        total_achievements: 0,
        achievements: [],
    }));
};

const fetchGameAchievements = async (ownedGames, steamId) => {
    const chunkSize = 50;
    
    for (let i = 0; i < ownedGames.length; i += chunkSize) {
        const chunk = ownedGames.slice(i, i + chunkSize);
        let achUrl = `https://api.steampowered.com/IPlayerService/GetTopAchievementsForGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&max_achievements=10000&language=${process.env.STEAM_LANG || 'english'}`;
        
        chunk.forEach((game, index) => {
            achUrl += `&appids%5B${index}%5D=${game.appid}`;
        });

        const achRes = await fetch(achUrl);
        const achData = await achRes.json();

        if (achData.response && achData.response.games) {
            achData.response.games.forEach((achGame) => {
                const targetGame = ownedGames.find((g) => Number(g.appid) === Number(achGame.appid));

                if (targetGame) {
                    targetGame.total_achievements = achGame.total_achievements || 0;

                    if (achGame.achievements) {
                        targetGame.completed_achievements = achGame.achievements.length;
                        targetGame.achievements = achGame.achievements.map((ach) => ({
                            name: ach.name || "Unknown",
                            description: ach.desc || "",
                            icon: ach.icon ? `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${targetGame.appid}/${ach.icon}` : "",
                            completion_percentage: parseFloat(ach.player_percent_unlocked) || 0
                        }));
                    }
                }
            });
        }
    }
    
    return ownedGames;
};

export const syncSteamDataToUser = async (user, steamId, forceSync = false) => {
    try {
        if (checkSyncCooldown(user, forceSync)) {
            console.log(`Skipping sync for ${user.name}. Last synced less than an hour ago.`);
            return; 
        }

        console.log(`--- Starting Steam Sync for ${user.name} ---`);

        const levelData = await fetchSteamLevelData(steamId);
        if (levelData) {
            user.steamLevel = levelData.level;
            user.steamXp = levelData.xp;
            user.steamXpNeeded = levelData.xpNeeded;
        }

        let ownedGames = await fetchOwnedGames(steamId);
        ownedGames = await fetchGameAchievements(ownedGames, steamId);

        user.ownedGames = ownedGames;
        user.lastSyncedAt = new Date();
        
        user.markModified("ownedGames");
        user.markModified("steamLevel"); 

        console.log(`--- Sync Complete for ${user.name} ---`);
    } catch (error) {
        console.error("Error during Steam sync:", error.message);
    }
};

const handleDirectLogin = async (steamId, profile, avatarUrl) => {
    let user = await User.findOne({ steamId: steamId });
    const safeName = profile.displayName || "Steam User";

    if (!user) {
        user = new User({
            name: safeName,
            steamId: steamId,
            avatar: avatarUrl,
        });
    } else {
        user.name = safeName;
        user.avatar = avatarUrl;
    }

    await syncSteamDataToUser(user, steamId);

    await user.save();
    console.log("STEAM USER SAVED TO DB:", user.name);

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const handleAccountLinking = async (linkToken, steamId, profile, avatarUrl) => {
    const decoded = jwt.verify(linkToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found");

    const safeName = profile.displayName || user.name;

    user.name = safeName;
    user.steamId = steamId;
    user.avatar = avatarUrl;

    await syncSteamDataToUser(user, steamId);

    await user.save();
    console.log("ACCOUNT LINKED AND GAMES SYNCED FOR:", user.name);

    return user;
};

passport.use(
    new SteamStrategy(
        {
            returnURL: `${baseUrl}/auth/steam/return`,
            realm: `${baseUrl}/`,
            apiKey: process.env.STEAM_API_KEY,
            passReqToCallback: true,
        },
        async (req, identifier, profile, done) => {
            try {
                const steamId = identifier.match(/\d+$/)[0];
                return done(null, { steamId, profile });
            } catch (error) {
                return done(error, null);
            }
        },
    ),
);

router.get("/steam", (req, res, next) => {
    const token = req.query.token;

    if (token) {
        res.cookie("jwt_link_temp", token, {
            maxAge: 1000 * 60 * 5,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
    }

    passport.authenticate("steam", { session: false })(req, res, next);
});

router.get(
    "/steam/return",
    passport.authenticate("steam", { session: false, failureRedirect: "/" }),
    async (req, res) => {
        try {
            const steamId = req.user.steamId;
            const profile = req.user.profile;

            const avatarUrl = profile._json?.avatarfull 
                || (profile.photos && profile.photos.length > 0 ? profile.photos[profile.photos.length - 1].value : "")
                || "";

            const linkToken = req.cookies.jwt_link_temp;

            if (linkToken) {
                await handleAccountLinking(linkToken, steamId, profile, avatarUrl);

                res.clearCookie("jwt_link_temp");
                return res.redirect(`${frontendUrl}/profile?linked=true`);

            } else {
                const authToken = await handleDirectLogin(steamId, profile, avatarUrl);

                res.cookie("auth_token", authToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 3600000,
                });

                return res.redirect(`${frontendUrl}/`);
            }
        } catch (err) {
            console.error("Steam Auth Error:", err);
            return res.redirect(`${frontendUrl}/login?error=steam_auth_failed`);
        }
    },
);

router.post("/logout", (req, res) => {
    res.clearCookie("auth_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return res.json({ message: "Logout successful" });
});

export default router;
