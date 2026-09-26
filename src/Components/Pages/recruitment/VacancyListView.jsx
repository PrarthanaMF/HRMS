import React, { useState } from 'react'
import VacancyFilters from './VacancyFilters'
import VacancyGrid from './VacancyGrid'
import VacancyDetailModal from './VacancyDetailModal'
import VacancyUpdateModal from './VacancyUpdateModal'
import CandidateDetailsModal from './CandidateDetailsModal'

const VacancyListView = () => {
    const [detailVacancy, setDetailVacancy] = useState(null)
    const [updateTarget, setUpdateTarget] = useState(null)
    const [candidatesVacancy, setCandidatesVacancy] = useState(null)

    const handleUpdate = (vacancy) => {
        // A closed hiring request can't be updated any more
        if (vacancy.status === 'Closed') return
        setDetailVacancy(null)
        setUpdateTarget(vacancy)
    }

    return (
        <>
            <VacancyFilters />
            <VacancyGrid onView={setDetailVacancy} onUpdate={handleUpdate} onViewCandidates={setCandidatesVacancy} />

            <VacancyDetailModal
                vacancy={detailVacancy}
                onClose={() => setDetailVacancy(null)}
                onUpdate={handleUpdate}
            />

            <CandidateDetailsModal
                vacancy={candidatesVacancy}
                onClose={() => setCandidatesVacancy(null)}
            />

            <VacancyUpdateModal
                vacancy={updateTarget}
                onClose={() => setUpdateTarget(null)}
            />
        </>
    )
}

export default VacancyListView