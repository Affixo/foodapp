import dns from "dns";
import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from your .env file");
  }

  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("DB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};
