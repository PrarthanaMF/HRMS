import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Home from './Pages/Home'
import Login from './Pages/Login'
import Workforce from './Pages/Workforce'
import Recruitment from './Pages/Recruitment'
import CandidateApplicationForm from './Pages/CandidateApplication'
import ExitProcess from './Pages/ExitProcess'

import EmployeeListView from './Components/Pages/Workforce/EmployeeListView'
import EmployeeFormView from './Components/Pages/Workforce/EmployeeFormView'

import VacancyListView from './Components/Pages/recruitment/VacancyListView'
import VacancyFormView from './Components/Pages/recruitment/VacancyFormView'
import RecruitmentTracker from './Components/Pages/recruitment/RecruitmentTracker'
import RecruitmentMis from './Components/Pages/recruitment/RecruitmentMis'

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
      <Route
        path='/login'
        element={
          <LoginAuth>
            <Login />
          </LoginAuth>
        }
      />

      <Route
        path='/candidates/apply'
        element={<CandidateApplicationForm />}
      />

      <Route
        element={
          <Protection>
            <HeaderDataProvider>
              <PageLayout />
            </HeaderDataProvider>
          </Protection>
        }
      >
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<div>Profile Page</div>} />

        <Route path='/workforce' element={<Workforce />}>
          <Route index element={<EmployeeListView />} />
          <Route path='add' element={<EmployeeFormView mode='add' />} />
          <Route path='edit/:empId' element={<EmployeeFormView mode='edit' />} />
        </Route>

        <Route path='/recruitment' element={<Recruitment />}>
          <Route index element={<Navigate to='vacancy' replace />} />
          <Route path='vacancy' element={<VacancyListView />} />
          <Route path='tracker' element={<RecruitmentTracker />} />
          <Route path='mis' element={<RecruitmentMis />} />
          <Route path='add' element={<VacancyFormView mode='add' />} />
          <Route path='edit/:jobId' element={<VacancyFormView mode='edit' />} />
        </Route>

        <Route path='/exit-process' element={<ExitProcess />}>
          <Route index element={<ExitDashboardView />} />
          <Route path='feedback' element={<ExitFeedbackView />} />
          <Route path='attrition' element={<AttritionView />} />
        </Route>
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App