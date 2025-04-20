import { Response } from "express";
import { AuthRequest } from "../types";
import { getEmbedding, model } from "../services/embeddings";
import { getPineconeIndex } from "../config/pinecone";
import { ContentModel } from "../models";
import { searchSchema } from "../utils/validation";

export const search = async (req: AuthRequest, res: Response): Promise<void> => {
  const validation = searchSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ message: "Search query is required" });
    return;
  }

  const { query } = req.body;
  const userId = req.userId;

  try {
    // Get embedding for the query
    const queryEmbedding = await getEmbedding(query);
    const pineconeIndex = getPineconeIndex();

    // Search in vector database for similar content
    const searchResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        userId: userId?.toString() || "",
      },
    });

    // Extract relevant content from database based on vector search results
    const contentIds = searchResponse.matches.map((match: any) => match.id);
    const relevantContent = await ContentModel.find({
      _id: { $in: contentIds },
      userId: userId,
    });

    // Map content to include similarity score
    const contentWithScores = relevantContent
      .map((content: any) => {
        const match = searchResponse.matches.find(
          (m: any) => m.id === content._id.toString()
        );
        return {
          ...content.toObject(),
          similarityScore: match ? match.score : 0,
        };
      })
      .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
      .slice(0, 2);

    // If no relevant content found
    if (contentWithScores.length === 0) {
      res.json({
        message:
          "No relevant content found in your second brain for this query.",
        results: [],
      });
      return;
    }

    // Build context from relevant content
    let context =
      "Below is the relevant information from the user's second brain:\n\n";
    contentWithScores.forEach((item: any, index: number) => {
      context += `[Content ${index + 1}]\nTitle: ${item.title}\nType: ${
        item.type
      }\n`;
      if (item.link) context += `Link: ${item.link}\n`;
      context += `Content: ${item.content}\n\n `;
    });

    const prompt = `${context}\n\nUser query: "${query}"\n\nBased on the information above from the user's second brain, please provide a helpful and concise response to their query. If the information doesn't contain a direct answer, try to extract relevant insights that might be helpful. if any is questions asked, try to answer it with your knowledege also.`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const answer =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({
      message: "Search results found",
      relevantContent: contentWithScores,
      answer: answer,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error processing search request" });
  }
};