import axios from "axios"


export const fetchSessionsById =async(userId:string,searchText:string)=>{
    const res =await axios.post(`http://localhost:3001/chat/getAllSessions/${userId}`,{
        searchText
    })
    return res.data
} 