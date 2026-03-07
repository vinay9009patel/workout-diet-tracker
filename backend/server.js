import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config();
console.log("GEMINI KEY LOADED:", !!process.env.GEMINI_API_KEY);
console.log("MONGO URI LOADED:", !!process.env.MONGO_URI);
console.log("JWT SECRET LOADED:", !!process.env.JWT_SECRET);

const { default: app } = await import("./app.js");

const BASE_PORT = Number(process.env.PORT) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} busy, trying ${port + 1}`);
      startServer(port + 1);
      return;
    }

    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
};

try {
  await connectDB();
  startServer(BASE_PORT);
} catch (error) {
  console.error("Failed to start server:", error.message);
  process.exit(1);
}
