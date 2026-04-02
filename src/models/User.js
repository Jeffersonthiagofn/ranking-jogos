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

    ownedGames: [
        {
            appid: { type: Number, required: true },
            playtime_forever: { type: Number, default: 0 },
            completed_achievements: { type: Number, default: 0 },
            total_achievements: { type: Number, default: 0 },
            unlocked_achievements: [{ type: String }],
        },
    ],

    favorites: [
        {
            appid: { type: Number, required: true },
        },
    ],
});

export default mongoose.model("User", UserSchema);
