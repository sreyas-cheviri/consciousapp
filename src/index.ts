import dotenv from 'dotenv';

// Load environment variables before any other imports
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/db";
import { initPinecone } from "./config/pinecone";

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await initPinecone();
  
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();