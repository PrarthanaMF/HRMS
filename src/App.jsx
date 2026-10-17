import React, { Suspense, lazy, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { fetchCurrentUser } from "./api/auth";
import { removeAuth, updateAuth } from "./Store/Redux/Login/AuthSlice";

import Protection from "./Components/Common/Protection";
import LoginAuth from "./Components/Common/LoginAuth";
import PageLayout from "./Components/Common/PageLayout";
import PageSkeleton from "./Components/Common/PageSkeleton";

import { HeaderDataProvider } from "./Store/Context/Header";

/*
 * Every screen is its own chunk, loaded the first time it is opened, so the first page a person
 * sees doesn't wait for the code of every other module (charts, recruitment, exit forms...).
 */
const named = (load, name) => lazy(() => load().then((module) => ({ default: module[name] })));

const Home = lazy(() => import("./Pages/Home"));
const Login = lazy(() => import("./Pages/Login"));
const Workforce = lazy(() => import("./Pages/Workforce"));
const Recruitment = lazy(() => import("./Pages/Recruitment"));
const CandidateApplicationForm = lazy(() => import("./Pages/CandidateApplication"));
const ExitProcess = lazy(() => import("./Pages/ExitProcess"));
const Attendance = lazy(() => import("./Pages/Attendance"));
const AttendanceHolidays = lazy(() => import("./Pages/AttendanceHolidays"));
const AttendanceUpload = lazy(() => import("./Pages/AttendanceUpload"));
const ComingSoon = lazy(() => import("./Pages/ComingSoon"));
const Master = lazy(() => import("./Pages/Master"));

const AttendanceApprovalsPage = named(() => import("./Pages/AttendanceApplications"), "AttendanceApprovalsPage");
const AttendanceRequestsPage = named(() => import("./Pages/AttendanceApplications"), "AttendanceRequestsPage");

const EmployeeListView = lazy(() => import("./Components/Pages/Workforce/EmployeeListView"));
const EmployeeFormView = lazy(() => import("./Components/Pages/Workforce/EmployeeFormView"));
const EmployeeDetailView = lazy(() => import("./Components/Pages/Workforce/EmployeeDetailView"));

const VacancyListView = lazy(() => import("./Components/Pages/recruitment/VacancyListView"));
const VacancyFormView = lazy(() => import("./Components/Pages/recruitment/VacancyFormView"));
const RecruitmentTracker = lazy(() => import("./Components/Pages/recruitment/RecruitmentTracker"));
const RecruitmentMis = lazy(() => import("./Components/Pages/recruitment/RecruitmentMis"));

const ExitDashboardView = lazy(() => import("./Components/Pages/ExitProcess/ExitDashboardView"));
const ExitFeedbackView = lazy(() => import("./Components/Pages/ExitProcess/ExitFeedbackView"));
const AttritionView = lazy(() => import("./Components/Pages/ExitProcess/AttritionView"));
const ResignationFormView = lazy(() => import("./Components/Pages/ExitProcess/ResignationFormView"));
const ExitDetailView = lazy(() => import("./Components/Pages/ExitProcess/ExitDetailView"));
const Stage1AcceptanceForm = lazy(() => import("./Components/Pages/ExitProcess/Stages/Stage1AcceptanceForm"));
const Stage2DecisionForm = lazy(() => import("./Components/Pages/ExitProcess/Stages/Stage2DecisionForm"));
const Stage3ExitInterviewForm = lazy(() => import("./Components/Pages/ExitProcess/Stages/Stage3ExitInterviewForm"));
const Stage4NoDueForm = lazy(() => import("./Components/Pages/ExitProcess/Stages/Stage4NoDueForm"));
const Stage5FNFClearanceForm = lazy(() => import("./Components/Pages/ExitProcess/Stages/Stage5FNFClearanceForm"));

const App = () => {
  const dispatch = useDispatch();

  // Ask the server who is signed in (the login cookie survives page reloads)
  useEffect(() => {
    fetchCurrentUser()
      .then((user) => dispatch(updateAuth(user)))
      .catch(() => dispatch(removeAuth()));
  }, [dispatch]);

  return (
    <Suspense fallback={<PageSkeleton bare />}>
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

          {/* The MIS tab has no content of its own yet; reserve it so it is not read as an employee id */}
          <Route path="mis" element={null} />

          <Route path=":empId" element={<EmployeeDetailView />} />
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
        <Route path="/attendance/holidays" element={<AttendanceHolidays />} />
        <Route path="/attendance/upload" element={<AttendanceUpload />} />

        <Route
          path="/attendance/salary"
          element={
            <ComingSoon
              title="Salary"
              icon="fa-solid fa-indian-rupee-sign"
              description="Salary worked out from attendance: payable days, deductions and payslips."
              points={[
                "Payable days come from the attendance report, once a month is locked for payroll.",
                "Lock a month on the attendance report before its salary can be worked out.",
              ]}
            />
          }
        />

        <Route
          path="/attendance/requests"
          element={<AttendanceRequestsPage />}
        />

        <Route
          path="/attendance/applications"
          element={<AttendanceApprovalsPage />}
        />

        {/* ==============================
            MODULES WITHOUT SCREENS YET
        ============================== */}

        <Route
          path="/onboarding"
          element={
            <ComingSoon
              title="Onboarding"
              icon="fa-solid fa-user-check"
              description="The joining process for new employees."
              points={["New employees are added today under Employees.", "Recruitment holds candidates up to the point of hire."]}
            />
          }
        />

        <Route
          path="/mis-reports"
          element={
            <ComingSoon
              title="MIS Reports"
              icon="fa-solid fa-chart-line"
              description="Management reporting across the HRMS modules."
              points={["Recruitment has its own MIS under Recruitment > MIS.", "Attendance totals are on the attendance report."]}
            />
          }
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
    </Suspense>
  );
};

export default App;
