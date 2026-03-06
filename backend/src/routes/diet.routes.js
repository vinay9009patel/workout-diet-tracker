import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import {
  createDiet,
  getDiets,
  updateDiet,
  deleteDiet,
} from "../controllers/diet.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, createDiet);
router.get("/", authMiddleware, getDiets);
router.put("/:id", authMiddleware, updateDiet);
router.delete("/:id", authMiddleware, deleteDiet);

export default router;
