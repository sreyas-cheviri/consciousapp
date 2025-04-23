import { GoogleGenerativeAI } from "@google/generative-ai";



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getEmbedding(text: string): Promise<number[]> {
  const MAX_EMBEDDING_SIZE = 30000; // Conservative limit in bytes
  
  // If text is already within limits, use it directly
  if (text.length <= MAX_EMBEDDING_SIZE) {
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embeddingModel.embedContent(text);
    
    if (result.embedding && typeof result.embedding === "object") {
      if ("values" in result.embedding && Array.isArray(result.embedding.values)) {
        return result.embedding.values;
      } else if (Array.isArray(result.embedding)) {
        return result.embedding;
      }
    }
    
    console.error("Unexpected embedding format:", result.embedding);
    throw new Error("Failed to get valid embedding");
  }
  
  // For larger text, summarize it first
  try {
    // Aggressive summarization using the model
    const summary = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Create a concise summary (under 5000 characters) that captures the essential meaning and key concepts of this text. Focus on the most important ideas only: ${text.substring(0, 25000)}...`
        }]
      }]
    });
    
    const summarizedText = summary.response?.text() || "";
    
    // If summary is still too long, truncate it
    const finalText = summarizedText.length > MAX_EMBEDDING_SIZE 
      ? summarizedText.substring(0, MAX_EMBEDDING_SIZE) 
      : summarizedText;
    
    // Get embedding of the summarized text
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embeddingModel.embedContent(finalText);
    
    if (result.embedding && typeof result.embedding === "object") {
      if ("values" in result.embedding && Array.isArray(result.embedding.values)) {
        return result.embedding.values;
      } else if (Array.isArray(result.embedding)) {
        return result.embedding;
      }
    }
    
    console.error("Unexpected embedding format:", result.embedding);
    throw new Error("Failed to get valid embedding");
  } catch (error) {
    console.error("Error during summarization or embedding:", error);
    
    // Fallback: simple truncation if summarization fails
    const truncatedText = text.substring(0, MAX_EMBEDDING_SIZE);
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await embeddingModel.embedContent(truncatedText);
    
    if (result.embedding && typeof result.embedding === "object") {
      if ("values" in result.embedding && Array.isArray(result.embedding.values)) {
        return result.embedding.values;
      } else if (Array.isArray(result.embedding)) {
        return result.embedding;
      }
    }
    
    throw new Error("Failed to get embedding even with fallback method");
  }
}