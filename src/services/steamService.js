import {Game} from '../models/Game.js';

export const importBaseList = async (gameList) =>{
    const BATCH_SIZE = 1000;
    let processed = 0;

    for (let i = 0; i < gameList.length; i += BATCH_SIZE) {
        const batch = gameList.slice(i, i + BATCH_SIZE).map(game => ({
            appid: game.appid,
            name: game.name,
            status: 'pending'
        }));

        try {
            console.log(gameList.length)
            await Game.insertMany(batch, { ordered: false});
            processed += batch.length;
            console.log(`Progress: ${processed} / ${gameList.length} games saved.`);
        
        }catch (err) {
            console.warn(`Batch starting at index ${i} contained duplicates, continuing...`);
        }
    }
    return processed;
};