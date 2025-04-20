import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes";
import searchRoutes from "./routes/searchRoutes";
import shareRoutes from "./routes/shareRoutes";

const app = express();

// Configure CORS
const allowedOrigins = [
  "https://consciousapp.vercel.app",
  "https://cronify-web-rho.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("server health check - conscious running!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/share", shareRoutes);

export default app;