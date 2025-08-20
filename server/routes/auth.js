import express, { Router } from "express";
import { login } from "../controllers/autoControllers.js";
const router = express.Router();

router.post("/login", login);

export default router;
