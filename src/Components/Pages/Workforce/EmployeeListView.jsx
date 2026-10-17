import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import WorkforceFilters from './WorkforceFilters'
import WorkforceTable from './WorkforceTable'
import { selectFilters } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { useEmployeeList } from '../../../Hooks/useEmployees'

const EmployeeListView = () => {
    const filters = useSelector(selectFilters)
    const [page, setPage] = useState(1)
    const list = useEmployeeList(filters, page)

    return (
        <>
            <WorkforceFilters onChange={() => setPage(1)} />
            <WorkforceTable {...list} page={page} onPage={setPage} />
        </>
    )
}

export default EmployeeListView
