import { Index, Pinecone } from "@pinecone-database/pinecone";
import { config } from "./env";

let pineconeIndex: Index;

export const initPinecone = async (): Promise<Index> => {
  try {
    const pinecone = new Pinecone({
      apiKey: config.pineconeApiKey,
    });
    
    pineconeIndex = pinecone.index(config.pineconeIndex);
    console.log("Connected to Pinecone");
    return pineconeIndex;
  } catch (error) {
    console.error("Error connecting to Pinecone:", error);
    throw error;
  }
};

export const getPineconeIndex = (): Index => {
  if (!pineconeIndex) {
    throw new Error("Pinecone index not initialized");
  }
  return pineconeIndex;
};