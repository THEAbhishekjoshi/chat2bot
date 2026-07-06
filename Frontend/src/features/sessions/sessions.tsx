import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchSessionsById } from './sessionApi';


export const fetchAllSessions = createAsyncThunk('session/allSessions', async ({userId,searchText}:{userId:string; searchText:string})=>{
    const res = await fetchSessionsById(userId,searchText)
    return res.result
})

export type sessionProps={
    sessionId:string,
    userId:string,
    title:string,
    createdAt:string,
    lastMessage:string
}

interface sessionState{
    sessions:sessionProps[]
    error: string | null
    loading: boolean 
}
const initialState:sessionState = {
    sessions: [],
    error: null,
    loading: false
}

export const sessionSlice = createSlice({
    name:"session",
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder
          .addCase(fetchAllSessions.fulfilled,(state,action)=>{
            state.loading = false
            state.sessions = action.payload
            state.error = null
          })
          .addCase(fetchAllSessions.pending,(state)=>{
            state.loading = true
          })
            .addCase(fetchAllSessions.rejected,(state,action)=>{ 
                state.loading = false
                state.error = action.payload as string || "Something went wrong"
            })   
    }

})

export default sessionSlice.reducer
