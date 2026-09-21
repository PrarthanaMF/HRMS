import { configureStore } from '@reduxjs/toolkit'
import AuthSlice from './Login/AuthSlice'
import EmployeeSlice from './Workforce/EmployeeSlice'

const store = configureStore({
    reducer: {
        auth: AuthSlice,
        employees: EmployeeSlice,
    },
})

export default store