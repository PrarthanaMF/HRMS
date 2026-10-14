import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { fetchCurrentUser } from "./api/auth";
import { removeAuth, updateAuth } from "./Store/Redux/Login/AuthSlice";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Workforce from "./Pages/Workforce";
import Recruitment from "./Pages/Recruitment";
import CandidateApplicationForm from "./Pages/CandidateApplication";
import ExitProcess from "./Pages/ExitProcess";
import Attendance from "./Pages/Attendance";
import Master from "./Pages/Master";

import {
  AttendanceApprovalsPage,
  AttendanceRequestsPage,
} from "./Pages/AttendanceApplications";

import EmployeeListView from "./Components/Pages/Workforce/EmployeeListView";
import EmployeeFormView from "./Components/Pages/Workforce/EmployeeFormView";

import VacancyListView from "./Components/Pages/recruitment/VacancyListView";
import VacancyFormView from "./Components/Pages/recruitment/VacancyFormView";
import RecruitmentTracker from "./Components/Pages/recruitment/RecruitmentTracker";
import RecruitmentMis from "./Components/Pages/recruitment/RecruitmentMis";

import ExitDashboardView from "./Components/Pages/ExitProcess/ExitDashboardView";
import ExitFeedbackView from "./Components/Pages/ExitProcess/ExitFeedbackView";
import AttritionView from "./Components/Pages/ExitProcess/AttritionView";
import ResignationFormView from "./Components/Pages/ExitProcess/ResignationFormView";
import ExitDetailView from "./Components/Pages/ExitProcess/ExitDetailView";
import Stage1AcceptanceForm from "./Components/Pages/ExitProcess/Stages/Stage1AcceptanceForm";
import Stage2DecisionForm from "./Components/Pages/ExitProcess/Stages/Stage2DecisionForm";
import Stage3ExitInterviewForm from "./Components/Pages/ExitProcess/Stages/Stage3ExitInterviewForm";
import Stage4NoDueForm from "./Components/Pages/ExitProcess/Stages/Stage4NoDueForm";
import Stage5FNFClearanceForm from "./Components/Pages/ExitProcess/Stages/Stage5FNFClearanceForm";

import Protection from "./Components/Common/Protection";
import LoginAuth from "./Components/Common/LoginAuth";
import PageLayout from "./Components/Common/PageLayout";

import { HeaderDataProvider } from "./Store/Context/Header";

const App = () => {
  const dispatch = useDispatch();

  // Ask the server who is signed in (the login cookie survives page reloads)
  useEffect(() => {
    fetchCurrentUser()
      .then((user) => dispatch(updateAuth(user)))
      .catch(() => dispatch(removeAuth()));
  }, [dispatch]);

  return (
    <Routes>
      {/* ==============================
          LOGIN
      ============================== */}

      <Route
        path="/login"
        element={
          <LoginAuth>
            <Login />
          </LoginAuth>
        }
      />

      {/* ==============================
          PUBLIC CANDIDATE APPLICATION
      ============================== */}

      <Route path="/candidates/apply" element={<CandidateApplicationForm />} />

      {/* ==============================
          PROTECTED HRMS
      ============================== */}

      <Route
        element={
          <Protection>
            <HeaderDataProvider>
              <PageLayout />
            </HeaderDataProvider>
          </Protection>
        }
      >
        {/* ==============================
            DASHBOARD
        ============================== */}

        <Route path="/" element={<Home />} />

        {/* ==============================
            PROFILE
        ============================== */}

        <Route path="/profile" element={<div>Profile Page</div>} />

        {/* ==============================
            WORKFORCE
        ============================== */}

        <Route path="/workforce" element={<Workforce />}>
          <Route index element={<EmployeeListView />} />

          <Route path="add" element={<EmployeeFormView mode="add" />} />

          <Route
            path="edit/:empId"
            element={<EmployeeFormView mode="edit" />}
          />
        </Route>

        {/* ==============================
            RECRUITMENT
        ============================== */}

        <Route path="/recruitment" element={<Recruitment />}>
          <Route index element={<Navigate to="vacancy" replace />} />

          <Route path="vacancy" element={<VacancyListView />} />

          <Route path="tracker" element={<RecruitmentTracker />} />

          <Route path="mis" element={<RecruitmentMis />} />

          <Route path="add" element={<VacancyFormView mode="add" />} />

          <Route path="edit/:jobId" element={<VacancyFormView mode="edit" />} />
        </Route>

        {/* ==============================
            ATTENDANCE
        ============================== */}

        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/approvals" element={<Navigate to="/attendance/applications" replace />} />
        <Route path="/attendance/holidays" element={<Navigate to="/master/imports" replace />} />

        <Route
          path="/attendance/requests"
          element={<AttendanceRequestsPage />}
        />

        <Route
          path="/attendance/applications"
          element={<AttendanceApprovalsPage />}
        />

        {/* ==============================
            HR SET-UP (MASTER)
        ============================== */}

        <Route path="/master" element={<Master />} />
        <Route path="/master/:tab" element={<Master />} />

        {/* ==============================
            EXIT PROCESS
        ============================== */}

        <Route path="/exit-process" element={<ExitProcess />}>
          <Route index element={<ExitDashboardView />} />

          <Route path="feedback" element={<ExitFeedbackView />} />

          <Route path="attrition" element={<AttritionView />} />
          <Route path="resignation" element={<ResignationFormView />} />
          <Route path="records/:id" element={<ExitDetailView />} />
          <Route path="records/:id/stage-1" element={<Stage1AcceptanceForm />} />
          <Route path="records/:id/stage-2" element={<Stage2DecisionForm />} />
          <Route path="records/:id/stage-3" element={<Stage3ExitInterviewForm />} />
          <Route path="records/:id/stage-4" element={<Stage4NoDueForm />} />
          <Route path="records/:id/stage-5" element={<Stage5FNFClearanceForm />} />
        </Route>
      </Route>

      {/* ==============================
          UNKNOWN ROUTES
      ============================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
