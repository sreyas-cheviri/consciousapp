import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env";


const genAI = new GoogleGenerativeAI(config.geminiApiKey);
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


export async function getEmbedding(text: string): Promise<number[]> {
  const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await embeddingModel.embedContent(text);

  
  if (result.embedding && typeof result.embedding === "object") {
    if (
      "values" in result.embedding &&
      Array.isArray(result.embedding.values)
    ) {
      return result.embedding.values;
    } else if (Array.isArray(result.embedding)) {
      return result.embedding;
    }
  }

  console.error("Unexpected embedding format:", result.embedding);
  throw new Error("Failed to get valid embedding");
}

export async function processContent(content: string): Promise<string> {
  // Break content into smaller chunks for LLM processing
  const CHUNK_SIZE = 2000;
  const chunks = [];
  
  for(let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }

  // Process each chunk and extract key information
  let processedContent = '';
  for(const chunk of chunks) {
    const summary = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Summarize the key points from this text: ${chunk}`
        }]
      }]
    });
    processedContent += summary.response?.text() + '\n';
  }

  return processedContent;
}