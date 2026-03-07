import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";
import {
  signup,
  login,
  getProfile,
  uploadAvatar,
  updateProfile,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);

export default router;
