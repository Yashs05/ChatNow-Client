import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import { authSlice } from "./Reducers/auth";
import { chatsSlice } from "./Reducers/chats";

const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        chats: chatsSlice.reducer
    },

    middleware: [thunk]
})

export default store