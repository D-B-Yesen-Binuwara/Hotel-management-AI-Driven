import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error connecting to MongoDB:", error.message);
    }
    process.exit(1);
  }
};

export default connectDB;
