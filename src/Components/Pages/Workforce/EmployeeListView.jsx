import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkforceFilters from './WorkforceFilters'
import WorkforceTable from './WorkforceTable'
import EmployeeDetailModal from './EmployeeDetailModal'

const EmployeeListView = () => {
    const navigate = useNavigate()
    const [detailEmployee, setDetailEmployee] = useState(null)

    const handleEdit = (employee) => {
        setDetailEmployee(null)
        navigate(`/workforce/edit/${employee.empId}`)
    }

    return (
        <>
            <WorkforceFilters />
            <WorkforceTable onMoreInfo={setDetailEmployee} />

            <EmployeeDetailModal
                employee={detailEmployee}
                onClose={() => setDetailEmployee(null)}
                onEdit={handleEdit}
            />
        </>
    )
}

export default EmployeeListView