import { useEffect, useRef, useState } from "react";
import { socket } from "../App";
import axios from "axios";
import { Copy, Mic, RefreshCcw, Send } from "lucide-react";
import user from "/user.svg";
import logo from "/logo1.svg";

type MessageProps = {
    role: "user" | "ai",
    content: string,
    responseId?: string
}
const ChatBot = () => {
    let [userMessage, setUserMessage] = useState("");
    const [socketId, setSocketId] = useState("");
    const [allMessages, setAllMessages] = useState<MessageProps[]>([
        { role: "ai", content: "hey! how are you doing today? 😊", responseId: "first" },
    ])
    const messageRef = useRef<HTMLDivElement>(null)
    let regenereate = false

    // typing state 
    const [typing, setTyping] = useState(true)

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

        socket.on("send_responseId", (id) => {
            setAllMessages((prev) => {
                const last = prev[prev.length - 1]
                if (last.role == "ai") {
                    last.responseId = id
                    console.log("---", last.responseId)
                }
                return [...prev.slice(0, -1), last]
            })
        })
        return () => {
            socket.off("send_chunks");
            socket.off("socket_id");
            socket.off("send_responseId")
        };
    }, []);

    const sendButton = async (overrideMessage?: string) => {

        const finalMessage = overrideMessage ?? userMessage
        console.log("final Message:", finalMessage)
        //no typing
        console.log("user message", userMessage)
        setTyping(false)
        if (!finalMessage.trim()) return;

        // Add user message
        if (!overrideMessage) {
           setAllMessages((prev) => [
                ...prev,
                { role: "user", content: finalMessage },
                { role: "ai", content: "", responseId: "" },
            ]);
            setUserMessage(""); 
        }

        // Send prompt to server via socket
        socket.emit("send_prompt", {
            userId: socketId,
            text: finalMessage,
            regenereate
        });

        // Trigger LangChain processing
        await axios.post("http://localhost:3001/chat/langchain/image", {
            socketId,
        });
        // typing enabled
        setTyping(true)

    };
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        console.log("Copied:", text)
    };


    const handleGenereateResponse = async (responseId: string) => {
        if (responseId) {
            let userTextResend = ""
            // ui update
            setAllMessages((prev) => {
                const idx = prev.findIndex(m => m.responseId === responseId)
                if (idx === -1) return prev


                const newList = [...prev]
                userTextResend = newList[idx - 1].content
                console.log("here:", newList[idx - 1])
                console.log("here:", newList[idx - 1].content)
                newList[idx] = { ...newList[idx], content: "" }

                //setUserMessage(newList[idx-1].content)
                //userTextResend =newList[idx-1].content
                const trimmedList = newList.slice(0, idx + 1)
                return trimmedList
            })

            // setUserMessage(userTextResend)
            // console.log("usermessge:",userMessage)
            // console.log("usermessge:",userTextResend)
            // db update
            socket.emit("update_messages", responseId)
            console.log("updating db...")
            // to genereate new response 
            setTimeout(() => {
                regenereate = true
                sendButton(userTextResend)
            }, 500);

        }
        else {
            throw new Error('messgeId not provided.')
        }
    };

    return (
        <div className="flex flex-col items-center mx-auto w-[70rem] h-full bg-[#3F424A] text-white px-30 ">
            {/* chats */}
            <div
                className="w-full mt-2 flex-1  py-5 chatmessages overflow-y-auto chat-messages "
                style={{ height: "calc(100vh - 8rem)" }}
            >
                {allMessages.map((m, i) => (
                    <div key={i} className="mb-2 ">

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
                            inline-block p-5 rounded-lg wrap-break-word text-[0.9rem]
                            max-w-[100%] text-justify
                            ${m.role === "user" ? "bg-[#4b4f5b]" :
                                    m.content.length > 0 ? "bg-[#282f3f] "
                                        : "bg-[#282f3f] animate-pulse "
                                }
                            `}
                        >
                            {/^(http|https):\/\//.test(m.content) ? (
                                <img src={m.content} className="rounded" />
                            ) : (
                                m.role === "ai" ? <div className="flex flex-col">
                                    <div ref={messageRef}>{m.content}</div>
                                    {m.content.length > 0 ? <div className="mt-4 flex gap-3 justify-end">
                                        <div className="text-[0.7rem] bg-[#202633] rounded-md p-2 hover:bg-[#121722] cursor-pointer"><button className="flex items-center gap-1 " onClick={() => {
                                            if (m.responseId) {
                                                console.log("id:", m.responseId)
                                                handleGenereateResponse(m.responseId)

                                            }
                                            else {
                                                console.log("here", m.responseId)
                                            }
                                        }}><RefreshCcw size={12} /> Generate Response</button> </div>
                                        <div className="text-[0.7rem] bg-[#202633] rounded-md p-2 hover:bg-[#121722] cursor-pointer"><button className="flex items-center gap-1 " onClick={() => handleCopy(m.content)}><Copy size={12} /> Copy</button> </div>
                                    </div> : <div></div>}


                                </div> : m.content
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="w-full py-3 ">
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
                        disabled={typing ? false : true}

                    />


                    {/* Send Button */}
                    <button className="p-2 rounded-lg hover:bg-[#3a3b3f] transition"
                        onClick={() => sendButton()}>
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
