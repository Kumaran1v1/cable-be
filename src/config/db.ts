import mongoose from "mongoose";

let retryTimer: NodeJS.Timeout | null = null;
let isConnecting = false;

// Configure global Mongoose buffer timeout for cloud free tiers (45s instead of 10s)
mongoose.set("bufferTimeoutMS", 45000);

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    "mongodb://127.0.0.1:27017/cable_db";

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds for Atlas server selection / DNS
      connectTimeoutMS: 30000,        // 30 seconds initial connection timeout
      socketTimeoutMS: 45000,         // 45 seconds socket timeout
      retryWrites: true,
    });
    isConnecting = false;
    console.log("MongoDB connected successfully");
  } catch (error) {
    isConnecting = false;
    console.error("MongoDB connection failed, retrying in 5 seconds...", error);
    // Automatic retry loop for cloud free tiers
    if (!retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        connectDB();
      }, 5000);
    }
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
  if (!retryTimer) {
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connectDB();
    }, 5000);
  }
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

export default connectDB;
