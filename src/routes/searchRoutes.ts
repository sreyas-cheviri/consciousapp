import express from "express";
import { search } from "../controllers/searchController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, search);

export default router;