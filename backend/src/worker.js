import mongoose from "mongoose";
import cron from "node-cron";
import { updateGameDetails, queueStaleGames, autoIngestIfEmpty } from "./services/steamService.js";

const startWorker = async () => {
    console.log("Worker Container Starting...");

    const url = process.env.MONGO_URL;
    if (!url) {
        console.error("Error: MONGO_URL is not defined for the worker.");
        process.exit(1);
    }

    try {
        await mongoose.connect(url);
        console.log("Worker connected to MongoDB");

        console.log("Running initial startup checks...");
        await autoIngestIfEmpty();
        console.log("Running initial game detail update...");
        await updateGameDetails();

        console.log("Scheduling background cron jobs...");
        
        cron.schedule("*/2 * * * *", () => {
            console.log("Cron triggered: Fetching the next batch of games...");
            updateGameDetails();
        });

        cron.schedule("0 3 * * *", () => {
            console.log("Running daily sweep for stale games...");
            queueStaleGames();
        });

        console.log("Worker is fully operational and waiting for cron triggers.");

    } catch (error) {
        console.error("Worker failed during execution:", error);
        process.exit(1);
    }
};

startWorker();