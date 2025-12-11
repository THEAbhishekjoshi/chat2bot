import axios from "axios"


export const fetchSessionsById =async(userId:string)=>{
    const res =await axios.get(`http://localhost:3001/chat/getAllSessions/${userId}`)
    return res.data
} 