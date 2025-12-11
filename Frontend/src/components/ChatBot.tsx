import { useEffect, useRef, useState } from "react";
import { socket } from "../App";
import axios from "axios";
import { Copy, Mic, RefreshCcw, Send } from "lucide-react";
import user from "/user.svg";
import logo from "/logo1.svg";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAllChats, resetChats } from "@/features/chats/chats";
import { setSessionId } from "@/features/globalstate/sessionState";
import { fetchAllSessions } from "@/features/sessions/sessions";

export type MessageProps = {
    role: "user" | "assistant" | "",
    content: string,
    messageId?: string
}

const ChatBot = () => {
    // test
    //const { sessionId, userId } = { sessionId:"adc77497-a8a1-4dc2-81f7-ebe0a9fb84c6", userId:"100001" }

    const dispatch = useAppDispatch()
    const sessionId = useAppSelector(state => state.globalState.currentSessionId);
    const userId = "100001"
    useEffect(() => {
        if (!sessionId) {
            const created = crypto.randomUUID()
            dispatch(setSessionId(created))
            return
        }

        dispatch(resetChats())
        // If sessionId exists → fetch chats
        dispatch(fetchAllChats({ sessionId }))
    }, [sessionId])

    const chatList = useAppSelector((state) => state.chats)
    useEffect(() => {
        setAllMessages(chatList);
    }, [chatList]);


    let [userMessage, setUserMessage] = useState("");
    const [socketId, setSocketId] = useState("");
    const socketIdRef= useRef(null)

    const [allMessages, setAllMessages] = useState<MessageProps[]>(chatList)


    const messageRef = useRef<HTMLDivElement>(null)
    let regenereate = false

    // typing state 
    const [typing, setTyping] = useState(true)

    useEffect(() => {
        socket.on("socket_id", (id) => {
            console.log(socket,"id 61")
            console.log(socket.id,"socket 62")
            setSocketId(id)
            //console.log(socketId,"62")
            socketIdRef.current = id
        });

        socket.on("send_chunks", (chunk) => {
            setAllMessages((prev) => {
                const last = prev[prev.length - 1]

                if (last?.role === "assistant") {
                    last.content += chunk;

                    // el -->(new chunk "lo")--> hello
                    return [...prev.slice(0, -1), last]
                }

                return [...prev, { role: "assistant", content: chunk }]
            })
        })

        socket.on("send_messageId", (id1, id2) => {
            setAllMessages((prev) => {
                if (prev.length < 2) return prev;

                const newPrev = prev.map(m => ({ ...m }))

                const lastIndex = newPrev.length - 1;
                const secondLastIndex = newPrev.length - 2;

                if (newPrev[lastIndex].role === "assistant") {
                    newPrev[lastIndex] = {
                        ...newPrev[lastIndex],
                        messageId: id1
                    };
                }

                if (newPrev[secondLastIndex].role === "user") {
                    newPrev[secondLastIndex] = {
                        ...newPrev[secondLastIndex],
                        messageId: id2
                    };
                }

                return newPrev;
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

        //no typing
        setTyping(false)
        if (!finalMessage.trim()) return;

        // Add user message
        if (!overrideMessage) {
            setAllMessages((prev) => [
                ...prev,
                { role: "user", content: finalMessage, messageId: "" },
                { role: "assistant", content: "", messageId: "" },
            ]);
            setUserMessage("");
        }

        // Send prompt to server via socket
        socket.emit("send_prompt", {
            userId: userId,
            sessionId: sessionId,
            text: finalMessage,
            regenereate
        });

        // Trigger LangChain processing
        console.log(socketId,"socketId 142 chatbot")
        console.log(socketIdRef.current,"socketId 143 chatbot")
        await axios.post("http://localhost:3001/chat/langchain/image", {
            socketId:socketIdRef.current
        })

        // typing enabled
        setTyping(true)

    };
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        //console.log("Copied:", text)
    };


    const handleGenereateResponse = async (messageId: string) => {
        if (messageId) {
            let userTextResend = ""
            // ui update
            setAllMessages((prev) => {
                const idx = prev.findIndex(m => m.messageId === messageId)
                if (idx === -1) return prev


                const newList = [...prev]
                userTextResend = newList[idx - 1].content
                newList[idx] = { ...newList[idx], content: "" }
                const trimmedList = newList.slice(0, idx + 1)
                return trimmedList
            })

            // db update
            socket.emit("update_messages", messageId)

            // To genereate new response 
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
        <div className={`flex flex-col items-center ${(allMessages.length > 0 && allMessages[0].role.length > 0) ? '' : 'justify-center'} mx-auto w-full h-full bg-[#3F424A] text-white px-2 sm:px-6 md:px-10 `}>
            {/* chats */}
            {(allMessages.length > 0 && allMessages[0].role.length > 0) ? <div
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
                                m.role === "assistant" ?
                                    <div className="flex flex-col">
                                        <div ref={messageRef}>{m.content}</div>
                                        {m.content.length > 0 ?
                                            <div className="mt-4 flex gap-3 justify-end">
                                                <div className="text-[0.7rem] bg-[#202633] rounded-md p-2 hover:bg-[#121722] cursor-pointer">
                                                    <button className="flex items-center gap-1 " onClick={() => {
                                                        if (m.messageId) {
                                                            //console.log("id:", m.messageId)
                                                            handleGenereateResponse(m.messageId)

                                                        }
                                                        else {
                                                            //console.log("here", m.messageId)
                                                        }
                                                    }}><RefreshCcw size={12} /><span className="hidden sm:inline-block">Generate Response</span>
                                                    </button>
                                                </div>
                                                <div className="text-[0.7rem] bg-[#202633] rounded-md p-2 hover:bg-[#121722] cursor-pointer">
                                                    <button className="flex items-center gap-1 " onClick={() => handleCopy(m.content)}>
                                                        <Copy size={12} /><span className="hidden sm:inline-block">Copy</span>
                                                    </button>
                                                </div>
                                            </div> : <div></div>
                                        }
                                    </div> : m.content
                            )}
                        </div>
                    </div>
                ))}
            </div>
                : <div className="text-xl sm:text-2xl md:text-3xl lg:text-5xl mb-4">What's on your mind today?</div>}

            <div className="w-full py-3 ">
                <div className="flex items-center  sm:gap-3 bg-[#2b2c30] px-1 sm:px-4 py-3 rounded-xl border border-[#3a3b3f]">

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
