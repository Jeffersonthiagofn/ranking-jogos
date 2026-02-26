import {Game} from '../models/Game.js';
import axios from 'axios';

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
            const result = await Game.insertMany(batch, { ordered: false});
            processed += batch.length;
            console.log(`Progress: ${processed} / ${gameList.length} games saved.`);
        
        }catch (err) {
          if (err.code === 11000 && err.insertedDocs){
            processed += err.insertedDocs.length;
            console.log(`Batch ${i}: Found duplicates, but saved ${err.insertedDocs.length} new games. (Total: ${processed})`);
          } else {
            console.warn(`Batch starting at index ${i} contained duplicates, continuing...`);
          }
        }
    }
    console.log(`Ingestion finished! Total new games added: ${processed}`);
    return processed;
};

// Create global padlock
let isUpdating = false;

export const updateGameDetails = async () => {
  if (isUpdating) {
    console.log('Previous batch is still running! Skipping this turn...');
    return;
  }

  isUpdating = true; 

  try {
    const gamesToUpdate = await Game.find({ status: 'pending' }).limit(35);

    if (gamesToUpdate.length === 0) {
      console.log('No pending games to update.');
      isUpdating = false;
      return;
    }

    console.log(`Found ${gamesToUpdate.length} games. Fetching details...`);

    for (const game of gamesToUpdate) {
      try {
        const storeUrl = `https://store.steampowered.com/api/appdetails?appids=${game.appid}`;
        const storeResponse = await axios.get(storeUrl);
        const gameData = storeResponse.data[game.appid];

        if (gameData && gameData.success) {
          const details = gameData.data;
          game.thumbnail = details.header_image;

          try {
            const apiKey = process.env.STEAM_API_KEY;
            const schemaUrl = `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${game.appid}`;
            const schemaResponse = await axios.get(schemaUrl);
            const stats = schemaResponse.data.game?.availableGameStats;

            if (stats && stats.achievements) {
              game.achievements = stats.achievements.map(ach => ({
                name: ach.displayName,
                description: ach.description || '',
                icon: ach.icon
              }));
              console.log(`   -> Found ${game.achievements.length} achievements for ${game.name}`);
            }
          } catch (schemaErr) {
             console.log(`   -> No achievements found for ${game.name}.`);
          }

          game.status = 'detailed';
        } else {
          game.status = 'erro'; 
        }

        await game.save();
        console.log(`Updated: ${game.name}`);

        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (err) {
        console.error(`Error fetching details for ${game.name}:`, err.message);
      }
    }

    console.log('Batch update complete!');

  } catch (error) {
    console.error('Database error in updateGameDetails:', error);
  } finally {
    isUpdating = false; 
  }
};