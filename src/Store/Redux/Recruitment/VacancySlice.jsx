import { createSlice, createSelector } from '@reduxjs/toolkit'
import { MOCK_VACANCIES } from '../../../Utils/mockRecruitment'

const initialFilters = {
    search: '',
    branch: 'All',
    designation: 'All',
    salaryRange: 'All',
    experienceRequired: 'All',
    status: 'All',
}

const initialState = {
    // Demo data for Current Vacancy only — Recruitment Tracker and MIS Reports
    // deliberately ignore it for now (their own SHOW_..._DATA flags are off).
    list: MOCK_VACANCIES,
    // Plain running serial number (1, 2, 3, ...) used as the S.No for every hiring
    // request. Starts after the demo rows above so a real submission never repeats
    // one of their numbers. Kept separate from list.length so numbers stay unique
    // and never repeat even if a request is ever removed from the list.
    nextSerial: MOCK_VACANCIES.length + 1,
    filters: initialFilters,
}

const VacancySlice = createSlice({
    name: 'vacancies',
    initialState,
    reducers: {
        // A new hiring request. The form sends requestorName / requestorEmpId (from the logged-in user).
        // jobId is the plain S.No — same number shown on the "request recorded" confirmation on the
        // New Hiring Request form, and in the Current Vacancy / Tracker / MIS views.
        addVacancy: (state, action) => {
            const jobId = String(state.nextSerial)
            state.nextSerial += 1
            state.list.unshift({
                _id: `vac_${Date.now()}`,
                jobId,
                status: 'Open',
                // Full timestamp (date + time), like the "Timestamp" column Google Forms records on submit
                requestedOn: new Date().toISOString(),
                ...action.payload,
            })
        },

        updateVacancy: (state, action) => {
            const { _id, ...updates } = action.payload
            const idx = state.list.findIndex(v => v._id === _id)
            if (idx !== -1) state.list[idx] = { ...state.list[idx], ...updates }
        },

        // Every time HR logs a candidate against a vacancy via the "New Recruitment"
        // form, the candidate is appended to that vacancy's candidate history instead
        // of overwriting a single set of candidate fields — this is what lets the
        // Current Vacancy table and Recruitment Tracker show a real headcount of how
        // many candidates have been submitted for that position.
        addCandidateToVacancy: (state, action) => {
            const { _id, candidate } = action.payload
            const idx = state.list.findIndex(v => v._id === _id)
            if (idx !== -1) {
                if (!state.list[idx].candidates) state.list[idx].candidates = []
                state.list[idx].candidates.push(candidate)
            }
        },

        // Edits one candidate in place (stage, remarks, next schedule date, offer / joining
        // details...). historyEntry is appended to the candidate's update history so earlier
        // remarks and stage changes are never lost.
        updateCandidate: (state, action) => {
            const { vacancyId, candidateId, changes, historyEntry } = action.payload
            const vacancy = state.list.find(v => v._id === vacancyId)
            const candidate = vacancy?.candidates?.find(c => c.id === candidateId)
            if (!candidate) return
            Object.assign(candidate, changes)
            if (historyEntry) candidate.history = [...(candidate.history || []), historyEntry]
        },

        toggleVacancyStatus: (state, action) => {
            const idx = state.list.findIndex(v => v._id === action.payload)
            if (idx !== -1) {
                state.list[idx].status = state.list[idx].status === 'Closed' ? 'Open' : 'Closed'
            }
        },

        // Moves a hiring request along the pipeline (Shortlist -> Interview -> Final Round -> Offer -> Join, or Reject / On Hold)
        updateVacancyStage: (state, action) => {
            const { _id, stage } = action.payload
            const idx = state.list.findIndex(v => v._id === _id)
            if (idx !== -1) state.list[idx].stage = stage
        },

        setVacancyFilter: (state, action) => {
            const { key, value } = action.payload
            state.filters[key] = value
        },

        resetVacancyFilters: (state) => {
            state.filters = initialFilters
        },
    },
})

export const {
    addVacancy,
    updateVacancy,
    addCandidateToVacancy,
    updateCandidate,
    toggleVacancyStatus,
    updateVacancyStage,
    setVacancyFilter,
    resetVacancyFilters,
} = VacancySlice.actions

export const selectAllVacancies = (state) => state.vacancies.list
// Every candidate submitted through "New Recruitment", across all vacancies, newest first —
// this is what the Recruitment Tracker table lists. Each row carries its vacancy's id so it
// can be found again for View / Update.
export const selectAllCandidates = createSelector(
    [selectAllVacancies],
    (list) => list
        .flatMap((v) => (v.candidates || []).map((c) => ({
            ...c,
            vacancyId: v._id,
            vacancyDesignation: v.designation,
            vacancyBranch: v.branch,
        })))
        .sort((a, b) => new Date(b.loggedOn) - new Date(a.loggedOn))
)

export const selectVacancyFilters = (state) => state.vacancies.filters

// The S.No that will be assigned to the *next* hiring request — used by the
// New Hiring Request form to show the same number on its confirmation screen.
export const selectNextSerialNumber = (state) => String(state.vacancies.nextSerial)

// createSelector remembers its last result, so the list is only re-filtered when
// the vacancies or the filters actually change (avoids needless re-renders)
export const selectFilteredVacancies = createSelector(
    [selectAllVacancies, selectVacancyFilters],
    (list, filters) => list.filter((v) => {
        if (filters.branch !== 'All' && v.branch !== filters.branch) return false
        if (filters.designation !== 'All' && v.designation !== filters.designation) return false
        if (filters.salaryRange !== 'All' && v.salaryRange !== filters.salaryRange) return false
        if (filters.experienceRequired !== 'All' && v.experienceRequired !== filters.experienceRequired) return false
        if (filters.status !== 'All' && v.status !== filters.status) return false
        if (filters.search) {
            const q = filters.search.toLowerCase()
            const match =
                v.jobId.toLowerCase().includes(q) ||
                v.designation.toLowerCase().includes(q) ||
                (v.requestorName || '').toLowerCase().includes(q)
            if (!match) return false
        }
        return true
    })
)

export default VacancySlice.reducer