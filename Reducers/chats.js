import { createSlice } from "@reduxjs/toolkit"

const options = {
    name: 'chats',
    initialState: {
        chats: [],
        loading: true,
        error: false
    },
    reducers: {
        setChats(state, action) {
            return {
                ...state,
                chats: action.payload,
                loading: false,
                error: false
            }
        },
        setMessages(state, action) {
            return {
                ...state,
                chats: action.payload
            }
        }
    }
}

export const chatsSlice = createSlice(options)