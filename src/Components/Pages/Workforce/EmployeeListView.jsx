import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import WorkforceFilters from './WorkforceFilters'
import WorkforceTable from './WorkforceTable'
import EmployeeDetailModal from './EmployeeDetailModal'
import { selectFilters } from '../../../Store/Redux/Workforce/EmployeeSlice'
import { useEmployeeList } from '../../../Hooks/useEmployees'
import { HR_ROLES } from '../../../Utils/roles'

const EmployeeListView = () => {
    const navigate = useNavigate()
    const user = useSelector(state => state.auth.value)
    const filters = useSelector(selectFilters)
    const [page, setPage] = useState(1)
    const [detailEmployee, setDetailEmployee] = useState(null)
    const list = useEmployeeList(filters, page)

    const handleEdit = (employee) => {
        setDetailEmployee(null)
        navigate(`/workforce/edit/${employee._id}`)
    }

    return (
        <>
            <WorkforceFilters onChange={() => setPage(1)} />
            <WorkforceTable {...list} page={page} onPage={setPage} onMoreInfo={setDetailEmployee} />

            <EmployeeDetailModal
                employee={detailEmployee}
                onClose={() => setDetailEmployee(null)}
                onEdit={HR_ROLES.includes(user?.role) ? handleEdit : null}
            />
        </>
    )
}

export default EmployeeListView
