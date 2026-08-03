import { createSlice } from '@reduxjs/toolkit'

export type globalStateProps = {
    currentSessionId: string,
}
const initialState: globalStateProps = {
    currentSessionId: "",
}
export const globalStateSlice = createSlice({
    name: "globalState",
    initialState,
    reducers: {
        setSessionId: (state, action) => {
            state.currentSessionId = action.payload;
        },
        resetGlobalState: (state) => {
            state.currentSessionId = "";
        }
    }
})
export const {
    setSessionId,
    resetGlobalState
} = globalStateSlice.actions
export default globalStateSlice.reducer 