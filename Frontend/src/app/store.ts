import { configureStore } from '@reduxjs/toolkit'
import chatReducer from '../features/chats/chats'
import sessionReucer from '../features/sessions/sessions'
import globalStateReducer from '../features/globalstate/sessionState'
export const store = configureStore({
    reducer:{
        chats:chatReducer,
        sessions:sessionReucer,
        globalState:globalStateReducer
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch