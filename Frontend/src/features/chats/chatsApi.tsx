import axios from "axios"


export const fetchBySessionId =async(sessionId:string)=>{
    const res =await axios.get(`http://localhost:3001/chat/getAllChats/${sessionId}`)
    return res.data
} 