import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workout.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, createWorkout);
router.get("/", authMiddleware, getWorkouts);
router.put("/:id", authMiddleware, updateWorkout);
router.delete("/:id", authMiddleware, deleteWorkout);

export default router;
