import express from "express";
import mongoose from "mongoose";
import cron from "node-cron";
import cors from "cors";
import jwt from "jsonwebtoken"; // 👈 CRITICAL: You need this for the GraphQL context!
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import adminRoutes from "./routes/adminRoutes.js";
import steamAuthRoutes from "./routes/steamAuth.js";
import { updateGameDetails, queueStaleGames, autoIngestIfEmpty } from "./services/steamService.js";
import User from "./models/User.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/admin", adminRoutes);
app.use("/auth", steamAuthRoutes);

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const url = process.env.MONGO_URL;
if (!url) {
    console.error("Error: MONGO_URL is not defined in the environment variables.");
    process.exit(1);
}

mongoose
    .connect(url)
    .then(async () => {
        console.log("Successfully connected to MongoDB");

        await server.start();

        app.use(
            "/graphql",
            expressMiddleware(server, {
                context: async ({ req }) => {
                    const authHeader = req.headers.authorization || "";
                    if (!authHeader.startsWith("Bearer ")) return { user: null };

                    const token = authHeader.split(" ")[1];
                    try {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        // return { user: decoded };
                        const user = await User.findById(decoded.id);

                        return { user };
                    } catch (err) {
                        console.warn("Invalid JWT provided to GraphQL");
                        return { user: null };
                    }
                },
            }),
        );

        app.listen(PORT, () => {
            console.log(`Server is awake and actively listening on port ${PORT}`);
            console.log(`GraphQL Sandbox is ready at http://localhost:${PORT}/graphql`);
        });

        await autoIngestIfEmpty();
        console.log("Server started! Running initial game detail update...");
        updateGameDetails();
    })
    .catch((err) => console.error("Database connection error:", err));

cron.schedule("*/2 * * * *", () => {
    console.log("Cron triggered: Fetching the next batch of games...");
    updateGameDetails();
});

cron.schedule("0 3 * * *", () => {
    console.log("Running daily sweep for stale games...");
    queueStaleGames();
});
