// import { createSlice } from "@reduxjs/toolkit";

// let val ={
//         name : 'Rabindra Kumar Sahoo',
//         role : 'Admin',
//         branches : ['Bangalore','Mangalore','Ranchi'],
//         designation : 'IT Manager',
//         _id : 'asdbKHAD36327QB7BWQEHQW982ajkA',
//         token : 'asdkashdkhasdkhsadkjasdjkhsadkjhdsakjhsadkhsadkjhsadkjhsadkyiuwy283764832uwqeuywqeiqweiuqywei7239472394729379324yi32yi32yiywieqyiqweyiqwyeiqwye36826348726438'
//     }

// let initialState = {
//     value : val
//     // value : {}
// }
// const AuthSlice = createSlice({
//     name : 'auth',
//     initialState,
//     reducers : {
//         updateAuth : (state,actions) =>{
//             state.value = actions.payload
//         },
//         removeAuth : (state) =>{
//             state.value = {}
//         }
//     }
// })

// export const {updateAuth,removeAuth} = AuthSlice.actions
// export default AuthSlice.reducer

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: {}   // Empty on load — user must log in
}

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAuth: (state, actions) => {
            state.value = actions.payload
        },
        removeAuth: (state) => {
            state.value = {}
        }
    }
})

export const { updateAuth, removeAuth } = AuthSlice.actions
export default AuthSlice.reducer