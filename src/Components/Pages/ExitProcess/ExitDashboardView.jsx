import React from 'react'
import { useNavigate } from 'react-router-dom'
import ExitFilters from './ExitFilters'
import ExitTable from './ExitTable'

const ExitDashboardView = () => {
    const navigate = useNavigate()

    const handleMoreInfo = (record) => {
        navigate(`/exit-process/records/${record._id}`)
    }

    return (
        <>
            <ExitFilters />
            <ExitTable onMoreInfo={handleMoreInfo} />
        </>
    )
}

export default ExitDashboardView