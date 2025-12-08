import { useEffect, useState } from "react";
import { socket } from "../App";
import axios from "axios";
import { Mic, Send } from "lucide-react";
import user from "/user.svg";
import logo from "/logo1.svg";


const ChatBot = () => {
    const [userMessage, setUserMessage] = useState("");
    const [socketId, setSocketId] = useState("");
    const [allMessages, setAllMessages] = useState([
        { role: "ai", content: "hey! how are you doing today? 😊" },
    ])

    const [connect, setConnect] = useState(true)

    // toggle button
    useEffect(() => {

        connect ? (socket.disconnect(), console.log("socket disconnected")) : (socket.connect(), console.log("socket connected"))

    }, [connect])


    useEffect(() => {
        socket.connect()

        socket.on("socket_id", (id) => {
            setSocketId(id)
        });

        socket.on("send_chunks", (chunk) => {
            setAllMessages((prev) => {
                const last = prev[prev.length - 1]

                if (last?.role === "ai") {
                    last.content += chunk;

                    // el -->(new chunk "lo")--> hello
                    return [...prev.slice(0, -1), last]
                }

                return [...prev, { role: "ai", content: chunk }]
            })
        })

        return () => {
            socket.off("send_chunks");
            socket.off("socket_id");
        };
    }, []);

    const sendButton = async () => {
        if (!userMessage.trim()) return;

        // Add user message
        setAllMessages((prev) => [
            ...prev,
            { role: "user", content: userMessage },
            { role: "ai", content: "" },
        ]);

        // Send prompt to server via socket
        socket.emit("send_prompt", {
            userId: socketId,
            text: userMessage,
        });

        // Trigger LangChain processing
        await axios.post("http://localhost:3001/chat/langchain/image", {
            socketId,
        });

        setUserMessage("");

    };

    return (
        <div className="flex flex-col w-full h-full bg-[#3F424A] text-white  ">

            <div
                className="flex-1 p-3 chatmessages overflow-y-auto"
                style={{ height: "calc(100vh - 8rem)" }}   // adjust as needed
            >
                {allMessages.map((m, i) => (
                    <div key={i} className="w-full mb-2">

                        {/* Role Header */}
                        <div className="font-semibold">
                            {m.role === "user" ? (
                                <div className="flex gap-3">
                                    <img src={user} alt="user" className="w-5 h-5 rounded-full" />
                                    You
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <img src={logo} alt="bot" className="w-5 h-5 rounded-full" />
                                    Response
                                </div>
                            )}
                        </div>

                        {/* Message Content */}
                        <div
                            className={`
          inline-block p-5 rounded-lg break-words text-[0.9rem]
          max-w-[70%]
          ${m.role === "user" ? "bg-[#4b4f5b]" : "bg-[#282f3f] w-[50rem]"}
        `}
                        >
                            {/^(http|https):\/\//.test(m.content) ? (
                                <img src={m.content} className="rounded" />
                            ) : (
                                m.content
                            )}
                        </div>
                    </div>
                ))}
            </div>



            {/* <textarea
                className="w-full mt-4 bg-white text-black p-2 rounded resize-none mt-8"
                value={userMessage}
                rows={3}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendButton()
                    }
                }}
            /> */}

            <div className="w-full px-4 py-3 ">
                <div className="flex items-center gap-3 bg-[#2b2c30] px-4 py-3 rounded-xl border border-[#3a3b3f]">

                    {/* Text input */}
                    <textarea
                        rows={1}
                        placeholder="Ask questions..."
                        value={userMessage}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 text-sm resize-none"
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                sendButton()
                            }
                        }}
                    />

                    {/* Send Button */}
                    <button className="p-2 rounded-lg hover:bg-[#3a3b3f] transition"
                        onClick={sendButton}>
                        <Send size={18} className="text-gray-300" />
                    </button>

                    {/* Mic Button */}
                    <button className="p-2 rounded-lg hover:bg-[#3a3b3f] transition">
                        <Mic size={20} className="text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
