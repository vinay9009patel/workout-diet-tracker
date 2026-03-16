import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./src/routes/auth.routes.js";
import workoutRoutes from "./src/routes/workout.routes.js";
import dietRoutes from "./src/routes/diet.routes.js";
import workoutPlanRoutes from "./src/routes/workoutPlan.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import exercisesRoutes from "./src/routes/exercises.routes.js";

const app = express();

/* ---------- Fix __dirname for ES Modules ---------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- CORS ---------- */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://workout-diet-tracker-withai.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ---------- Middleware ---------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Static Files ---------- */

app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

/* ---------- Health Check ---------- */

app.get("/", (req, res) => {
  res.json({
    message: "Workout Diet Tracker API running 🚀",
  });
});

/* ---------- API Routes ---------- */

app.use("/api/auth", authRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/plan", workoutPlanRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/exercises", exercisesRoutes);

/* ---------- 404 Handler ---------- */

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ---------- Error Handler ---------- */

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

export default app;