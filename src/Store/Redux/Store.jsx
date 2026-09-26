import { configureStore } from '@reduxjs/toolkit'
import AuthSlice from './Login/AuthSlice'
import EmployeeSlice from './Workforce/EmployeeSlice'
import VacancySlice from './Recruitment/VacancySlice'
import ExitSlice from './ExitProcess/ExitSlice'
const store = configureStore({
    reducer: {
        auth: AuthSlice,
        employees: EmployeeSlice,
        vacancies: VacancySlice,
        exits:ExitSlice,
    },
})

export default store