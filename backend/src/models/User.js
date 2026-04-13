import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: function () {
            return !this.steamId;
        },
        unique: true,
        sparse: true,
    },

    password: {
        type: String,
        required: function () {
            return !this.steamId;
        },
    },

    steamId: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
    },

    displayName: String,

    avatar: String,

    steamLevel: { type: Number, default: 0 },
    steamXp: { type: Number, default: 0 },
    steamXpNeeded: { type: Number, default: 0 },

    ownedGames: [
        {
            appid: { type: Number, required: true },
            playtime_forever: { type: Number, default: 0 },
            completed_achievements: { type: Number, default: 0 },
            total_achievements: { type: Number, default: 0 },
            achievements: [{ 
                name: String,
                description: String,
                icon: String,
                completion_percentage: Number
            }],
        },
    ],

    favorites: [
        {
            appid: { type: Number, required: true },
        },
    ],

    lastSyncedAt: { type: Date },
});

export default mongoose.model("User", UserSchema);
