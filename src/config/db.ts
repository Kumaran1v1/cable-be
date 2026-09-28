import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cable_db";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
