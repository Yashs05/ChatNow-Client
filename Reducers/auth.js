import { createSlice } from "@reduxjs/toolkit"

const options = {
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        loading: true,
        error: false
    },
    reducers: {
        setUser(state, action) {
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: false
            }
        },
        setToken(state, action) {
            return {
                ...state,
                token: action.payload
            }
        }
    }
}

export const authSlice = createSlice(options)