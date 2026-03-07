import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { getExercisesByBodyPart } from "../controllers/exercises.controllers.js";

const router = express.Router();

router.get("/:bodyPart", authMiddleware, getExercisesByBodyPart);

export default router;
