import {configureStore,} from '@reduxjs/toolkit'
import AuthSlice from './Login/AuthSlice'
import EmployeeSlice from './Workforce/EmployeeSlice'

import VacancySlice from './Recruitment/VacancySlice'
import AttendanceSlice from './Attendance/AttendanceSlice'
import ExitSlice from './ExitProcess/ExitSlice'

const store = configureStore({
  reducer: {
    auth: AuthSlice,
    employees: EmployeeSlice,
    vacancies: VacancySlice,
    attendance: AttendanceSlice,
    exits: ExitSlice,
  },
});

export default store