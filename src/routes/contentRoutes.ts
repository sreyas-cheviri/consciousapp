import express from "express";
import { addContent, getContent, deleteContent } from "../controllers/contentController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, addContent);
router.get("/", auth, getContent);
router.delete("/:contentId", auth, deleteContent);

export default router;