import express from "express";
import getAllChats from "../controllers/fetchChats.js";

const router = express.Router();


router.get("/getAllChats/:sessionId",getAllChats)

export default router;
