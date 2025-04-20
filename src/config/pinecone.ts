import { Index, Pinecone } from "@pinecone-database/pinecone";

let pineconeIndex: Index;

export const initPinecone = async (): Promise<Index> => {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
    });
    
    pineconeIndex = pinecone.index(process.env.PINECONE_INDEX || '');
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