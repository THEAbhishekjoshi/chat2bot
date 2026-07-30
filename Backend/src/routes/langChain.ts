import express from "express";

import imageGeneration from "../controllers/chatController.js";

const router = express.Router();


router.post("/respond", imageGeneration)

export default router;
