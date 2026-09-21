import { createSlice } from '@reduxjs/toolkit'
import { MOCK_EMPLOYEES } from '../../../Utils/mockEmployees'

const initialFilters = {
    branch: 'All',
    search: '',
    status: 'All',
    department: 'All',
    designation: 'All',
    company: 'All',
    reportingManager: 'All',
}

const initialState = {
    list: MOCK_EMPLOYEES,
    filters: initialFilters,
}

const EmployeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        addEmployee: (state, action) => {
            const nextId = String(1000 + state.list.length + 1)
            state.list.unshift({
                _id: `emp_${Date.now()}`,
                empId: nextId,
                status: 'Active',
                ...action.payload,
            })
        },

        updateEmployee: (state, action) => {
            const { _id, ...updates } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) state.list[idx] = { ...state.list[idx], ...updates }
        },

        deleteEmployee: (state, action) => {
            state.list = state.list.filter(e => e._id !== action.payload)
        },

        setFilter: (state, action) => {
            const { key, value } = action.payload
            state.filters[key] = value
        },

        resetFilters: (state) => {
            state.filters = initialFilters
        },
    },
})

export const {
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setFilter,
    resetFilters,
} = EmployeeSlice.actions

// ----- Selectors -----
export const selectAllEmployees = (state) => state.employees.list
export const selectFilters = (state) => state.employees.filters

export const selectFilteredEmployees = (state) => {
    const { list, filters } = state.employees
    return list.filter((emp) => {
        if (filters.branch !== 'All' && emp.branch !== filters.branch) return false
        if (filters.status !== 'All' && emp.status !== filters.status) return false
        if (filters.department !== 'All' && emp.department !== filters.department) return false
        if (filters.designation !== 'All' && emp.designation !== filters.designation) return false
        if (filters.company !== 'All' && emp.company !== filters.company) return false
        if (filters.reportingManager !== 'All' && emp.reportingManager !== filters.reportingManager) return false
        if (filters.search) {
            const q = filters.search.toLowerCase()
            const match = emp.name.toLowerCase().includes(q) || emp.empId.toLowerCase().includes(q)
            if (!match) return false
        }
        return true
    })
}

export const selectEmployeeByEmpId = (empId) => (state) =>
    state.employees.list.find(e => e.empId === empId)

export default EmployeeSlice.reducer