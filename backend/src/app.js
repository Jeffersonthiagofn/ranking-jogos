import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import adminRoutes from "./routes/adminRoutes.js";
import steamAuthRoutes from "./routes/steamAuth.js";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, 
}));

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
        console.log("API Server connected to MongoDB");

        await server.start();

        app.use(
            "/graphql",
            expressMiddleware(server, {
                context: async ({ req, res }) => {
                    let token = req.headers.authorization?.split(" ")[1];
                    
                    if (!token && req.cookies && req.cookies.auth_token) {
                        token = req.cookies.auth_token;
                    }

                    if (!token) {
                        return { user: null, res };
                    }

                    try {
                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        return { user: decoded, res };
                    } catch (err) {
                        return { user: null, res };
                    }
                },
            }),
        );

        app.listen(PORT, () => {
            console.log(`API Server is awake and actively listening on port ${PORT}`);
            console.log(`GraphQL Sandbox is ready at http://localhost:${PORT}/graphql`);
        });
    })
    .catch((err) => console.error("Database connection error:", err));