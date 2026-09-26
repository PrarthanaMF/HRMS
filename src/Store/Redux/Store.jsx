import { configureStore } from '@reduxjs/toolkit'
import AuthSlice from './Login/AuthSlice'
import EmployeeSlice from './Workforce/EmployeeSlice'
import VacancySlice from './Recruitment/VacancySlice'
const store = configureStore({
    reducer: {
        auth: AuthSlice,
        employees: EmployeeSlice,
        vacancies: VacancySlice,
    },
})

export default store