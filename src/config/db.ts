import mongoose from "mongoose";
import { config } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB");
    console.error(error);
    process.exit(1);
  }
};