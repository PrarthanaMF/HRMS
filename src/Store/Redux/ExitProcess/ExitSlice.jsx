import { createSlice } from '@reduxjs/toolkit'
import { MOCK_EXITS } from '../../../Utils/mockExits'

// ============================================================
// Initial state
// ============================================================
const initialFilters = {
    branch: 'All',
    search: '',
    status: 'All',
    department: 'All',
    removalType: 'All',
}

const initialState = {
    list: MOCK_EXITS,
    filters: initialFilters,
}

// ============================================================
// Slice
// ============================================================
const ExitSlice = createSlice({
    name: 'exits',
    initialState,
    reducers: {
        // ---------- Stage 0: Employee submits resignation ----------
        addExit: (state, action) => {
            const today = new Date().toISOString().split('T')[0]
            state.list.unshift({
                _id: `exit_${Date.now()}`,
                empId: '',
                name: '',
                email: '',
                phone: '',
                branch: '',
                location: '',
                department: '',
                division: '',
                designation: '',
                reportingManager: '',
                reportingManagerContact: '',
                divisionHead: '',
                divisionHeadContact: '',
                resignationDate: today,
                lastWorkingDate: '',
                reason: '',
                noticePeriod: '30 days',
                removalType: 'Resigned',
                status: 'Pending HR',
                stage1: null,
                stage2: null,
                stage3: null,
                stage4: null,
                stage5: null,
                ...action.payload,
            })
        },

        // ---------- Stage 1 ----------
        updateStage1: (state, action) => {
            const { _id, stage1, status } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) {
                state.list[idx].stage1 = { ...stage1, submittedAt: new Date().toISOString() }
                state.list[idx].status = status
            }
        },

        // ---------- Stage 2 ----------
        updateStage2: (state, action) => {
            const { _id, stage2, status } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) {
                state.list[idx].stage2 = { ...stage2, submittedAt: new Date().toISOString() }
                state.list[idx].status = status
            }
        },

        // ---------- Stage 3 ----------
        updateStage3: (state, action) => {
            const { _id, stage3, status } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) {
                state.list[idx].stage3 = { ...stage3, submittedAt: new Date().toISOString() }
                state.list[idx].status = status
            }
        },

        // ---------- Stage 4 ----------
        updateStage4: (state, action) => {
            const { _id, stage4, status } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) {
                state.list[idx].stage4 = { ...stage4, submittedAt: new Date().toISOString() }
                state.list[idx].status = status
            }
        },

        // ---------- Stage 5 ----------
        updateStage5: (state, action) => {
            const { _id, stage5, status } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) {
                state.list[idx].stage5 = { ...stage5, submittedAt: new Date().toISOString() }
                state.list[idx].status = status
            }
        },

        // ---------- Filters ----------
        setFilter: (state, action) => {
            const { key, value } = action.payload
            state.filters[key] = value
        },

        resetFilters: (state) => {
            state.filters = initialFilters
        },

        // ---------- Utility ----------
        updateExit: (state, action) => {
            const { _id, ...updates } = action.payload
            const idx = state.list.findIndex(e => e._id === _id)
            if (idx !== -1) {
                state.list[idx] = { ...state.list[idx], ...updates }
            }
        },

        deleteExit: (state, action) => {
            state.list = state.list.filter(e => e._id !== action.payload)
        },

        resetExits: (state) => {
            state.list = MOCK_EXITS
        },
    },
})

// ============================================================
// Actions
// ============================================================
export const {
    addExit,
    updateStage1,
    updateStage2,
    updateStage3,
    updateStage4,
    updateStage5,
    setFilter,
    resetFilters,
    updateExit,
    deleteExit,
    resetExits,
} = ExitSlice.actions

// ============================================================
// Selectors
// ============================================================

export const selectAllExits = (state) => state.exits.list

export const selectExitById = (id) => (state) =>
    state.exits.list.find(e => e._id === id)

export const selectExitByEmpId = (empId) => (state) =>
    state.exits.list.find(e => e.empId === empId)

export const selectActiveExits = (state) =>
    state.exits.list.filter(e => e.status !== 'Exited' && e.status !== 'Withdrawn')

export const selectExitCountsByStatus = (state) => {
    const counts = {}
    state.exits.list.forEach(e => {
        counts[e.status] = (counts[e.status] || 0) + 1
    })
    return counts
}

export const selectExitFilters = (state) => state.exits.filters

export const selectFilteredExits = (state) => {
    const { list, filters } = state.exits
    return list.filter(e => {
        if (filters.branch !== 'All' && e.branch !== filters.branch) return false
        if (filters.status !== 'All' && e.status !== filters.status) return false
        if (filters.department !== 'All' && e.department !== filters.department) return false
        if (filters.removalType !== 'All' && e.removalType !== filters.removalType) return false
        if (filters.search) {
            const q = filters.search.toLowerCase()
            const match =
                (e.name || '').toLowerCase().includes(q) ||
                (e.empId || '').toLowerCase().includes(q)
            if (!match) return false
        }
        return true
    })
}

export default ExitSlice.reducer