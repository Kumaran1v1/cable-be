import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

// Main API Routes
app.use("/api", routes);
app.use("/api/api", routes); // Fallback for clients prefixing /api twice

// Error Handling Middleware
app.use(errorHandler);

export default app;
