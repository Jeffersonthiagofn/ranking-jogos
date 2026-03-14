import {Game} from '../models/Game.js';
import axios from 'axios';


export const STEAM_CONFIG = {
  MAX_RESULTS: 100000,
  HEALTH_THRESHOLD: 80000 
};

// Create global padlock
let isUpdating = false;

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

export const autoIngestIfEmpty = async () => {
  try {
    const count = await Game.countDocuments();
    
    if (count > STEAM_CONFIG.HEALTH_THRESHOLD) {
      console.log(`Database already contains ${count} games. Skipping initial ingestion.`);
      return { status: 'skipped', count };
    }

    console.log('Database is empty! Fetching the initial Steam ID list...');
    
    const apiKey = process.env.STEAM_API_KEY;

    let moreResults = true;
    let lastAppId = 0;
    let totalSavedAllPages = 0;

    while (moreResults && totalSavedAllPages < STEAM_CONFIG.MAX_RESULTS) {
      
      const url = `https://api.steampowered.com/IStoreService/GetAppList/v1/?key=${apiKey}&max_results=50000&last_appid=${lastAppId}`;
      const response = await axios.get(url);
      const data = response.data.response;

      let appsToSave = data.apps || [];

      if (totalSavedAllPages + appsToSave.length > STEAM_CONFIG.MAX_RESULTS) {
        const remainingSlots = STEAM_CONFIG.MAX_RESULTS - totalSavedAllPages;
        appsToSave = appsToSave.slice(0, remainingSlots);
        moreResults = false;
        console.log(`Reached the MAX_RESULTS limit of ${STEAM_CONFIG.MAX_RESULTS}. Truncating final batch...`);
      }

      if (appsToSave.length > 0) {
        console.log(`Downloading a page of ${appsToSave.length} games. Saving to database...`);
        const savedThisPage = await importBaseList(appsToSave);
        totalSavedAllPages += savedThisPage;
      }

      if (moreResults && data.have_more_results && data.last_appid) {
        lastAppId = data.last_appid;
        console.log(`Fetching the next page starting after AppID ${lastAppId}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      } else {
        moreResults = false;
      }
    }

    console.log(`Complete database seeding finished! Total games processed: ${totalSavedAllPages}`);

    return { status: 'completed', count: totalSavedAllPages };

  } catch (err) {
    console.error('Error during auto-ingestion:', err.message);
    throw err;
  }
};

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
          
          game.description = details.short_description || '';
          game.developer = details.developers ? details.developers[0] : 'Unknown';
          game.genres = details.genres ? details.genres.map(g => g.description) : [];

          if (details.is_free) {
            game.is_free = true;
            game.price = 'Free to Play';
          } else if (details.price_overview) {
            game.is_free = false;
            game.price = details.price_overview.final_formatted;
          }

          if (details.release_date && !details.release_date.coming_soon) {
            game.release_date = details.release_date.date;
          } else {
            game.release_date = 'TBA';
          }

          try {
            const apiKey = process.env.STEAM_API_KEY;
            const schemaUrl = `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${apiKey}&appid=${game.appid}`;
            const schemaResponse = await axios.get(schemaUrl);
            const stats = schemaResponse.data.game?.availableGameStats;

            if (stats && stats.achievements) {
              
              let percentagesMap = {};
              try {
                const pctUrl = `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${game.appid}`;
                const pctResponse = await axios.get(pctUrl);
                const pctList = pctResponse.data.achievementpercentages?.achievements || [];
                
                pctList.forEach(p => {
                  percentagesMap[p.name] = p.percent;
                });
              } catch (pctErr) {
                console.log(`   -> Could not fetch achievement percentages for ${game.name}.`);
              }

              game.achievements = stats.achievements.map(ach => {

                const rawPercent = Number(percentagesMap[ach.name]) || 0; 
                
                return {
                  name: ach.displayName,
                  description: ach.description || '',
                  icon: ach.icon,
                  
                  completion_percentage: Number(rawPercent.toFixed(1)) 
                };
              });

              console.log(`   -> Found ${game.achievements.length} achievements with % stats for ${game.name}`);
            }
          } catch (schemaErr) {
             console.log(`   -> Failed to fetch achievements for ${game.name}: ${schemaErr.message}`);
          }

          try {
            const playerUrl = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.appid}`;
            const playerResponse = await axios.get(playerUrl);
            
            if (playerResponse.data.response && playerResponse.data.response.result === 1) {
              const currentCount = playerResponse.data.response.player_count || 0; 
              game.current_players = currentCount;
              
              if (currentCount > (game.all_time_peak || 0)) {
                game.all_time_peak = currentCount;
              }

              game.player_history.push({
                timestamp: new Date(),
                player_count: currentCount
              });

              console.log(`   -> Current players: ${currentCount} | Peak: ${game.all_time_peak}`);
            }
          } catch (playerErr) {
            console.log(`   -> Could not fetch active players for ${game.name}.`);
            game.current_players = 0;
          }

          try {
            const reviewUrl = `https://store.steampowered.com/appreviews/${game.appid}?json=1&language=all`;
            const reviewResponse = await axios.get(reviewUrl);
            const summary = reviewResponse.data.query_summary;

            if (summary && summary.total_reviews > 0) {
              const total = summary.total_reviews;
              const positive = summary.total_positive;
              
              const percentageScore = Math.round((positive / total) * 100);

              game.ranking_data = {
                positive_votes: positive,
                score: percentageScore
              };
              
              console.log(`   -> Rating: ${percentageScore}% Positive (${positive} upvotes)`);
            } else {
              console.log(`   -> No reviews found for ${game.name}.`);
            }
          } catch (reviewErr) {
            console.log(`   -> Could not fetch reviews for ${game.name}.`);
          }

          game.status = 'detailed';
          game.last_updated = new Date();

        } else {
          game.status = 'erro'; 
        }

        await game.save();
        console.log(`Updated: ${game.name}`);

        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (err) {
        console.error(`Error fetching details for ${game.name}:`, err.message);
        game.status = 'erro'; 
        await game.save();
      }
    }

    console.log('Batch update complete!');

  } catch (error) {
    console.error('Database error in updateGameDetails:', error);
  } finally {
    isUpdating = false; 
  }
};

export const queueStaleGames = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Game.updateMany(
      { status: 'detailed', last_updated: { $lt: thirtyDaysAgo } },
      { $set: { status: 'pending' } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Sweeper: Sent ${result.modifiedCount} stale games back to the pending queue.`);
    }
  } catch (error) {
    console.error('Error queuing stale games:', error);
  }
};