import express from "express";
import passport from "passport";
import SteamStrategy from "passport-steam";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

const fetchAndFormatSteamGames = async (steamId) => {
    try {
        const gamesUrl = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}&format=json`;
        const gamesRes = await fetch(gamesUrl);
        const gamesData = await gamesRes.json();

        if (gamesData.response && gamesData.response.games) {
            return gamesData.response.games.map((game) => ({
                appid: game.appid,
                playtime_forever: game.playtime_forever,
                completed_achievements: 0,
                total_achievements: 0,
                unlocked_achievements: [],
            }));
        }
        return [];
    } catch (error) {
        console.error(`Failed to fetch games for SteamID ${steamId}:`, error);
        return [];
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

    const fetchedGames = await fetchAndFormatSteamGames(steamId);
    if (fetchedGames.length > 0) {
        user.ownedGames = fetchedGames;
    }

    await user.save();
    console.log("STEAM USER SAVED TO DB:", user.name);

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const handleAccountLinking = async (linkToken, steamId, avatarUrl) => {
    const decoded = jwt.verify(linkToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found");

    user.steamId = steamId;
    if (!user.avatar) user.avatar = avatarUrl;

    const fetchedGames = await fetchAndFormatSteamGames(steamId);
    if (fetchedGames.length > 0) {
        user.ownedGames = fetchedGames;
    }

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
            const avatarUrl =
                profile.photos && profile.photos.length > 0 ? profile.photos[2].value : "";

            const linkToken = req.cookies.jwt_link_temp;

            if (linkToken) {
                await handleAccountLinking(linkToken, steamId, avatarUrl);

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
