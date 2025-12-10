import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { fetchBySessionId } from './chatsApi'
import type { MessageProps } from '@/components/ChatBot'


export const fetchAllChats = createAsyncThunk('chat/allChats', async ({ sessionId}: { sessionId: string}) => {
    const res = await fetchBySessionId(sessionId)
    return res.result
})

const initialState: MessageProps[] = []

export const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        resetChats(state) {
            return [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllChats.fulfilled, (state, action) => {
                state.push(...action.payload)
            })
    }

})
export const {resetChats} = chatSlice.actions 
export default chatSlice.reducer