import app from "./app";
import { config } from "./config/env";
import { connectDatabase } from "./config/db";
import { initPinecone } from "./config/pinecone";

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Initialize Pinecone
    await initPinecone();
    
    // Start server
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();