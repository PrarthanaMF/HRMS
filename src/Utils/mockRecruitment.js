// ---------- Dropdown lists (taken from the "Recruitment Request" Google Form) ----------
export const DESIGNATIONS = [
    'Accounts Assistant', 'Accounts Assistant Manager', 'Accounts Executive', 'Accounts Head', 'Accounts manager',
    'Admin Assistant', 'Admin Executive', 'Assistant frontend developer', 'Assistant Team Leader', 'Audit Assistant',
    'Backed Developer', 'Branch manager', 'Business Development Manager', 'Collection Executive', 'Cook',
    'Customer Relationship Executive', 'Data Management Assistant', 'Data Management Executive', 'Delivery Boy',
    'Developer', 'Digital Marketing Executive', 'Dispatch Executive', 'Driver', 'EA', 'Executive', 'Factory Supervisor',
    'Filing assistant', 'Front end developer', 'GM', 'Godown Assistant', 'Godown Incharge', 'Godown Manager',
    'Graphic Designer', 'Hardware Engineer', 'Housekeeping', 'HR Assistant', 'HR Assistant Manager', 'HR Executive',
    'HR Manager', 'Import Executive', 'Intern', 'Jr. Sales Executive', 'Legal Assistant', 'Manager', 'MDO',
    'MIS Executive', 'Office Boy', 'Office Watchman', 'Operations', 'Partner', 'PC', 'Process Co-Ordinator',
    'Production Executive', 'Purchase Assistant', 'Purchase Executive', 'Purchase Manager', 'Receptionist',
    'Sales Engineer', 'Sales Executive', 'Sales Manager', 'Stock MIS Executive', 'Team Leader', 'Trainer',
    'Trainer Assistant',
]

export const BRANCHES = [
    'Ahmedabad', 'Aurangabad', 'Bangalore', 'Bhiwandi', 'Chennai', 'Coimbatore', 'Delhi', 'Dullapally', 'Goregaon',
    'Hubli', 'Hyderabad', 'Hyderabad-Tape', 'Jaipur', 'Kolkata', 'Madurai', 'Mangalore', 'Mohali', 'Nagpur', 'Pune',
    'Raipur', 'Ranchi', 'Rasoolpura', 'Salem', 'Siliguri',
]

export const SALARY_RANGES = [
    'under 10K', '10-15K', '15-20K', '20-25K', '25-30K', '30-35K', '35-40K', '40-60K', '60-80K', '80-100K',
    '1-1.25L', '1.25-1.50L', '1.50-2L', '2L +',
]

export const EXPERIENCE_LEVELS = [
    'Fresher', '1-2 Years', '2-4 Years', '5-7 Years', '8-10 Years', '10-14 Years', '15-17 Years', '17-20 Years', '20+ Years',
]

export const VACANCY_STATUSES = ['Open', 'On Hold', 'Closed']

// Filter dropdowns = same lists with "All" in front
export const VACANCY_FILTER_OPTIONS = {
    branch: ['All', ...BRANCHES],
    designation: ['All', ...DESIGNATIONS],
    salaryRange: ['All', ...SALARY_RANGES],
    experienceRequired: ['All', ...EXPERIENCE_LEVELS],
    status: ['All', ...VACANCY_STATUSES],
}

// ---------- Sample hiring requests (Current Vacancy demo data only) ----------
// Recruitment Tracker and MIS Reports deliberately ignore this list for now
// (see SHOW_TRACKER_DATA / SHOW_MIS_DATA in their own files) — this is only
// here so Current Vacancy has something to show for a demo.
export const MOCK_VACANCIES = [
    { _id: 'vac_101', jobId: '1', requestorName: 'Rabindra Kumar Sahoo', requestorEmpId: '1001', designation: 'Front end developer', branch: 'Bangalore', jobDescription: 'Build and maintain the React based HR portal. Work closely with the backend team and own UI quality.', salaryRange: '40-60K', openings: 2, experienceRequired: '2-4 Years', targetDate: '2026-10-15', status: 'Open', requestedOn: '2026-08-01T10:24:00.000Z' },
    { _id: 'vac_102', jobId: '2', requestorName: 'Ashish Bansal', requestorEmpId: '1004', designation: 'HR Executive', branch: 'Mangalore', jobDescription: 'Handle end-to-end recruitment and onboarding coordination for the Mangalore branch.', salaryRange: '20-25K', openings: 1, experienceRequired: '1-2 Years', targetDate: '2026-09-30', status: 'Open', requestedOn: '2026-08-10T06:47:00.000Z' },
    { _id: 'vac_103', jobId: '3', requestorName: 'Murari Saraf', requestorEmpId: '1006', designation: 'Sales Executive', branch: 'Ranchi', jobDescription: 'Generate leads, meet dealers and close orders in the Ranchi territory. Two wheeler required.', salaryRange: '25-30K', openings: 3, experienceRequired: '1-2 Years', targetDate: '2026-10-05', status: 'Open', requestedOn: '2026-08-20T12:03:00.000Z' },
    { _id: 'vac_104', jobId: '4', requestorName: 'Rabindra Kumar Sahoo', requestorEmpId: '1001', designation: 'Accounts Executive', branch: 'Bangalore', jobDescription: 'Day to day bookkeeping, GST filing support and vendor reconciliation.', salaryRange: '15-20K', openings: 1, experienceRequired: '2-4 Years', targetDate: '2026-11-10', status: 'On Hold', requestedOn: '2026-09-02T09:15:00.000Z' },
    { _id: 'vac_105', jobId: '5', requestorName: 'Ashish Bansal', requestorEmpId: '1004', designation: 'Driver', branch: 'Mangalore', jobDescription: 'Local deliveries and branch errands. Valid heavy vehicle licence preferred.', salaryRange: '10-15K', openings: 1, experienceRequired: 'Fresher', targetDate: '2026-08-30', status: 'Closed', requestedOn: '2026-07-25T14:38:00.000Z' },
]

// ---------- New Recruitment (candidate tracker form) lists ----------
// Same choices as the company Google Form
export const RECRUITMENT_STAGES = ['Shortlist', 'Interview', 'Final Round', 'Reject', 'Offer', 'Join', 'On Hold']
export const RECRUITMENT_SOURCES = [
    'Internal-Maruti Group', 'Indeed', 'Apna', 'Workindia', 'Naukri', 'Talent Source', 'HireQ', 'Jobhai',
    'Hirect', 'MyRocket', 'Linked in', 'Internshaala', 'Q Jobs', 'Agencies', 'Expertia.ai',
]
export const RECRUITMENT_DIVISIONS = ['Flex', 'Granules', 'Tape']

export const STAGE_STYLES = {
    Shortlist: 'bg-sky-50 text-sky-700 border-sky-200',
    Interview: 'bg-amber-50 text-amber-700 border-amber-200',
    'Final Round': 'bg-orange-50 text-orange-700 border-orange-200',
    Reject: 'bg-red-50 text-red-600 border-red-200',
    Offer: 'bg-violet-50 text-violet-700 border-violet-200',
    Join: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'On Hold': 'bg-slate-100 text-slate-600 border-slate-200',
}

// HR Name dropdown on the New Recruitment form (list taken from the company Google Form)
export const HR_NAMES = [
    'Ashish Bansal', 'Atul Agarwal', 'Ayush Jindal', 'Deepak Bishnoi', 'Harsh Daruka', 'Lalit Jain',
    'Mukesh Ganesh Garhia', 'Murari Saraf', 'Nitin Kumar Jain', 'Pawan Kumar Bansal', 'Pramod Bansal',
    'Prashant Garg', 'Rabindra Kumar Sahoo', 'Ravi Jaisansaria', 'Reetika Chawla', 'Rohit Bansal',
    'Ruchika Agarwal', 'Sanjay Kumar Agarwal', 'Shubham Agarwal', 'Shyam Khemka', 'Vinod Bansal',
]


// ---------- Candidate "Update" rules (Recruitment Tracker) ----------
// The Next Schedule Date question only appears for these stages
export const NEXT_DATE_STAGES = ['Shortlist', 'Interview', 'Final Round', 'Offer', 'On Hold']
// "Company" dropdown under Offer Details — add the rest of the companies from the Google Form here
export const COMPANIES = [
    'Abhyant Traders', 'Anjaneya Traders', 'Balaji Traders', 'Hanumant Traders', 'Mahaveer Traders',
    'Maruti Flex Advisors LLP', 'Maruti Flex Private Limited', 'Maruti Flex Traders LLP',
    'Maruti Tapes India LLP', 'Maruti Tapes Private Limited', 'Shaurya Traders',
]
export const FINAL_STATUSES = ['Recent joined', 'Immediately Left', 'Retain']
// The dropdown was collapsed in the screenshot, so this is a placeholder list — replace
// it with the real options from "Decline reasons" on the Google Form.
export const DECLINE_REASONS = [
    'Salary expectation mismatch', 'Not interested', 'Better offer elsewhere', 'Location not suitable',
    'Not responding', 'Skill mismatch', 'Notice period too long', 'Other',
]
// Link shown as a reminder alongside "Upload Joining Form"
export const JOINING_FORM_LINK = 'http://tiny.cc/f8cruz'
// "Interviewer" dropdown on the Interview Update Section — same staff pool as HR_NAMES
export const INTERVIEWERS = HR_NAMES