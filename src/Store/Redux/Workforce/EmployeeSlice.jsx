import { createSlice } from '@reduxjs/toolkit'
import { MOCK_EMPLOYEES } from '../../../Utils/mockEmployees'

// Employees come from the backend (src/api/employees.js); this slice keeps the list filters
// and a revision number that makes open lists reload after a save.
const initialFilters = {
    branchId: 'All',
    search: '',
    status: 'Active',
    department: 'All',
    designation: 'All',
    company: 'All',
    reportingManagerId: 'All',
}

const initialState = {
    filters: initialFilters,
    revision: 0,
}

const EmployeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            const { key, value } = action.payload
            state.filters[key] = value
        },

        resetFilters: (state) => {
            state.filters = initialFilters
        },

        employeesChanged: (state) => {
            state.revision += 1
        },
    },
})

export const {
    setFilter,
    resetFilters,
    employeesChanged,
} = EmployeeSlice.actions

// ----- Selectors -----
export const selectFilters = (state) => state.employees.filters
export const selectEmployeesRevision = (state) => state.employees.revision

// Recruitment is still a demo (no backend yet) and picks people from the sample list
export const selectAllEmployees = () => MOCK_EMPLOYEES

export default EmployeeSlice.reducer
