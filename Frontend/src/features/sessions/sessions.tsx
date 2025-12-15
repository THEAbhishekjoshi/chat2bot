import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchSessionsById } from './sessionApi';
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'


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
const initialState:sessionProps[] =[]

export const sessionSlice = createSlice({
    name:"session",
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder
          .addCase(fetchAllSessions.fulfilled,(state,action)=>{
            return action.payload
          })
    }

})

export default sessionSlice.reducer