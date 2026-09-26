import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Home from './Pages/Home'
import Login from './Pages/Login'
import Workforce from './Pages/Workforce'
import ExitProcess from './Pages/ExitProcess'

import EmployeeListView from './Components/Pages/Workforce/EmployeeListView'
import EmployeeFormView from './Components/Pages/Workforce/EmployeeFormView'

import ExitDashboardView from './Components/Pages/ExitProcess/ExitDashboardView'
import ExitFeedbackView from './Components/Pages/ExitProcess/ExitFeedbackView'
import AttritionView from './Components/Pages/ExitProcess/AttritionView'

import Protection from './Components/Common/Protection'
import LoginAuth from './Components/Common/LoginAuth'
import PageLayout from './Components/Common/PageLayout'
import { HeaderDataProvider } from './Store/Context/Header'

const App = () => {
  return (
    <Routes>

      {/* ---------- Public ---------- */}
      <Route path='/login' element={<LoginAuth><Login /></LoginAuth>} />

      {/* ---------- Authenticated layout wraps every page ---------- */}
      <Route element={
        <Protection>
          <HeaderDataProvider>
            <PageLayout />
          </HeaderDataProvider>
        </Protection>
      }>
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<div>Profile Page</div>} />

        {/* Workforce nested */}
        <Route path='/workforce' element={<Workforce />}>
          <Route index element={<EmployeeListView />} />
          <Route path='add' element={<EmployeeFormView mode='add' />} />
          <Route path='edit/:empId' element={<EmployeeFormView mode='edit' />} />
        </Route>

        {/* Exit Process — nested INSIDE the layout */}
        <Route path='/exit-process' element={<ExitProcess />}>
          <Route index element={<ExitDashboardView />} />
          <Route path='feedback'    element={<ExitFeedbackView />} />
          <Route path='attrition'   element={<AttritionView />} />
        </Route>

      </Route>

    </Routes>
  )
}

export default App