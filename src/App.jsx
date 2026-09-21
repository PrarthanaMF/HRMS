import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Login from './Pages/Login'
import Workforce from './Pages/Workforce'
import EmployeeListView from './Components/Pages/Workforce/EmployeeListView'
import EmployeeFormView from './Components/Pages/Workforce/EmployeeFormView'
import Protection from './Components/Common/Protection'
import LoginAuth from './Components/Common/LoginAuth'
import { HeaderDataProvider } from './Store/Context/Header'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Protection><HeaderDataProvider><Home /></HeaderDataProvider></Protection>} />

      <Route path='/workforce' element={<Protection><HeaderDataProvider><Workforce /></HeaderDataProvider></Protection>}>
        <Route index element={<EmployeeListView />} />
        <Route path='add' element={<EmployeeFormView mode='add' />} />
        <Route path='edit/:empId' element={<EmployeeFormView mode='edit' />} />
      </Route>

      <Route path='/login' element={<LoginAuth><Login /></LoginAuth>} />
    </Routes>
  )
}

export default App