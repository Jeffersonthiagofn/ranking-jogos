import express from 'express';
import { importBaseList } from '../services/steamService.js';
import axios from 'axios';

const router = express.Router();

router.get('/ingest-steam-ids', async (req, res) => {
    try {
        const apiKey = process.env.STEAM_API_KEY;
        const url = `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${apiKey}&max_results=100000`;

        const response = await axios.get(url);
        const gameList = response.data.response.apps;

        const totalSaved = await importBaseList(gameList);
        res.json({message: "Ingestion complete", count: totalSaved});

    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Ingestion failed"});
    }
});

export default router;