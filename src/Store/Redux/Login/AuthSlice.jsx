import { createSlice } from "@reduxjs/toolkit";

// Load user from localStorage on app boot
const loadUserFromStorage = () => {
    try {
        const saved = localStorage.getItem('auth_user')
        return saved ? JSON.parse(saved) : {}
    } catch (err) {
        console.error('Failed to load auth from localStorage:', err)
        return {}
    }
}

const initialState = {
    value: loadUserFromStorage()
}

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAuth: (state, actions) => {
            state.value = actions.payload
            // Persist to localStorage
            try {
                localStorage.setItem('auth_user', JSON.stringify(actions.payload))
            } catch (err) {
                console.error('Failed to save auth to localStorage:', err)
            }
        },
        removeAuth: (state) => {
            state.value = {}
            // Clear from localStorage
            localStorage.removeItem('auth_user')
        }
    }
})

export const { updateAuth, removeAuth } = AuthSlice.actions
export default AuthSlice.reducer