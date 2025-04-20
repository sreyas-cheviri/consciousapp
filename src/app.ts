import express from "express";
import cors from "cors";
import { config } from "./config/env";
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes";
import searchRoutes from "./routes/searchRoutes";
import shareRoutes from "./routes/shareRoutes";
const app = express();


app.use(
  cors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    credentials: true,
  })
);

app.use(express.json());


app.get("/", (_req, res) => {
  res.send("server health check - conscious running!");
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/share", shareRoutes);


export default app;