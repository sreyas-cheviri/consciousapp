import express from "express";
import { shareBrain, getBrainByShareLink } from "../controllers/shareController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, shareBrain);
router.get("/:shareLink", getBrainByShareLink);

export default router;