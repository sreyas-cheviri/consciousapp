import dotenv from 'dotenv';

// Load environment variables before any other imports
dotenv.config();

import app from "./app";
import { config } from "./config/env";
import { connectDatabase } from "./config/db";
import { initPinecone } from "./config/pinecone";

const startServer = async (): Promise<void> => {
  try {
  
    await connectDatabase();
  
    await initPinecone();
  
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();