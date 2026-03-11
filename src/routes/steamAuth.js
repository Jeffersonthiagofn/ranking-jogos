import express from 'express';
import passport from 'passport';
import SteamStrategy from 'passport-steam';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const port = process.env.PORT || 3000;

const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

passport.use(new SteamStrategy({
    returnURL: `${baseUrl}/auth/steam/return`,
    realm: `${baseUrl}/`,
    apiKey: process.env.STEAM_API_KEY,
    passReqToCallback: true
  },
  async (req, identifier, profile, done) => {
    try {
      const steamId = identifier.match(/\d+$/)[0];
      
      return done(null, { steamId, profile });
    } catch (error) {
      return done(error, null);
    }
  }
));

router.get('/steam', (req, res, next) => {
  const token = req.query.token;
  if (!token) return res.status(401).send("No JWT provided");

  res.cookie('jwt_temp', token, { maxAge: 1000 * 60 * 10, httpOnly: true });
  
  passport.authenticate('steam', { session: false })(req, res, next);
});

router.get('/steam/return', 
  passport.authenticate('steam', { session: false, failureRedirect: '/' }), 
  async (req, res) => {
    const token = req.cookies.jwt_temp;
    if (!token) return res.status(401).send("Session expired during Steam login.");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id);
      
      user.steamId = req.user.steamId;
      user.name = req.user.profile.displayName;
      if (req.user.profile.photos && req.user.profile.photos.length > 0) {
        user.avatar = req.user.profile.photos[2].value;
      }

      await user.save();

      res.clearCookie('jwt_temp');
      //res.redirect('Front end Url that we still dont have ;-;');
      res.json({
        success: true,
        message: "Steam account linked successfully!",
        updatedUser: {
          name: user.name,
          steamId: user.steamId,
          avatar: user.avatar
        }
      });

    } catch (err) {
      console.error(err);
      res.status(500).send("Error linking Steam account");
    }
  }
);

export default router;