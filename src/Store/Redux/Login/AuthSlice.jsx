import { createSlice } from "@reduxjs/toolkit";

// The signed-in user lives in the httpOnly cookie on the server; this slice only mirrors it.
// status: "checking" (asking the server on start-up), "authenticated" or "anonymous".
const initialState = {
    value: {},
    status: "checking",
}

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAuth: (state, actions) => {
            state.value = actions.payload
            state.status = "authenticated"
        },
        removeAuth: (state) => {
            state.value = {}
            state.status = "anonymous"
        }
    }
})

export const { updateAuth, removeAuth } = AuthSlice.actions
export default AuthSlice.reducer
