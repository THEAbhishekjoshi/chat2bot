import express from "express";
import { getAllSessions } from "../controllers/fetchSessions.js";

const router = express.Router();


router.get("/getAllSessions/:userId",getAllSessions)

export default router;
