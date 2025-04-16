import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongoUrl: process.env.MONGO_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  pineconeApiKey: process.env.PINECONE_API_KEY as string,
  pineconeIndex: process.env.PINECONE_INDEX as string,
  geminiApiKey: process.env.GEMINI_API_KEY as string,
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    origins: [
      "https://consciousapp.vercel.app",
      "https://cronify-web-rho.vercel.app",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
};