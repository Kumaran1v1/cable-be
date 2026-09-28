import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
