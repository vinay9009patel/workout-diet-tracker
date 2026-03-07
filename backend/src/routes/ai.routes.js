import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { chatAI, workoutAI, dietAI } from "../controllers/ai.controllers.js";

const router = express.Router();

router.post("/chat", authMiddleware, chatAI);
router.post("/workout", authMiddleware, workoutAI);
router.post("/diet", authMiddleware, dietAI);

export default router;
