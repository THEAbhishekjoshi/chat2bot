import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import router from "./routes/langChain.js";
import createUserTable, { createMemoryTable, updateResponseId } from "./db/model.js";

const app = express();
app.use(express.json());
app.use(cors());

// HTTP server
const server = http.createServer(app);

// SOCKET INSTANCE
export const io = new SocketIOServer(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
})

// PROMPTS BY SOCKET ID
export const userPrompts: Record<string, string> = {}
export let isRegenereate : boolean = false

// call DB
createUserTable()
createMemoryTable()


io.on("connection", (socket) => {
    console.log("User connected:", socket.id)
    socket.emit("socket_id", socket.id)

    // Get prompt 
    socket.on("send_prompt", ({ text, userId,regenereate}) => {
        userPrompts[socket.id] = text;
        console.log("regeneration:",regenereate)
        isRegenereate = regenereate
        //userPrompts[socket.id + "_regen"] = regenerate
        // console.log("Received prompt for:", userId, text)
        // console.log("user-prompts",userPrompts)
    })

    socket.on("update_messages", async (responseId) => {
        console.log("update_messages received:", responseId);
        await updateResponseId({ responseId });
    });

    socket.on("disconnect", () => {
        delete userPrompts[socket.id]
        console.log("disconnected")
    })
})

// ROUTES
app.use("/chat", router);

server.listen(3001, () => {
    console.log("Server running at http://localhost:3001");
});
