import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import experimentRoutes from "./routes/experimentRoutes.js";
import protocolRoutes from "./routes/protocolRoutes.js";
import reactionRoutes from "./routes/reactionRoutes.js";
import observationRoutes from "./routes/observationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = new Set([
  ...(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.has(origin)),
  }),
);
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/experiments", experimentRoutes);
app.use("/api/protocols", protocolRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/observations", observationRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDatabase()
  .then(() =>
    app.listen(port, () => console.log(`Server listening on port ${port}`)),
  )
  .catch((error) => {
    console.error("Could not connect to MySQL:", error.message);
    process.exit(1);
  });
