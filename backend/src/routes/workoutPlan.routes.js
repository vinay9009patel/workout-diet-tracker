import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import {
  saveWorkoutPlan,
  getWorkoutPlan,
} from "../controllers/workoutPlan.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, saveWorkoutPlan);
router.get("/", authMiddleware, getWorkoutPlan);

export default router;
