import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from "./routes/analyze.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "QualityGuard AI Backend is running",
  });
});

app.use("/api/analyze", analyzeRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`QualityGuard backend running on port ${PORT}`);
});
