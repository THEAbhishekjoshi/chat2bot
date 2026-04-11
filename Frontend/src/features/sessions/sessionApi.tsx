import axios from "axios"


export const fetchSessionsById =async(userId:string,searchText:string)=>{
    const res =await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/getAllSessions/${userId}`,{
        searchText
    })
    return res.data
} 

