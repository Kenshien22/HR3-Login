import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import connecToDatabase from "./db/db.js";

connecToDatabase();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
