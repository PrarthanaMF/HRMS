// Each record contains Stage 0 data (basic info) + nested stage1-stage5 objects.
// Only stages that have been completed will be non-null.

export const MOCK_EXITS = [

    // ============================================================
    // 1 — Kavita Rao  ·  Pending HR  ·  Only Stage 0 done
    // ============================================================
    {
        _id: 'exit_001',
        empId: '1005',
        name: 'Kavita Rao',
        email: 'hrexec@marutiflex.com',
        phone: '+91 98765 43214',
        branch: 'Bangalore',
        location: 'Koramangala',
        department: 'Human Resources',
        division: 'Corporate',
        designation: 'HR Executive',
        reportingManager: 'Anita Desai',
        reportingManagerContact: '+91 98765 40004',
        divisionHead: 'Priya Sharma',
        divisionHeadContact: '+91 98765 40001',

        // Stage 0 — Employee submission
        resignationDate: '2025-09-20',
        lastWorkingDate: '2025-10-20',
        reason: 'Better career opportunity',
        noticePeriod: '30 days',
        removalType: 'Resigned',

        // Current stage
        status: 'Pending HR',

        // Nested stages
        stage1: null,
        stage2: null,
        stage3: null,
        stage4: null,
        stage5: null,
    },

    // ============================================================
    // 2 — Sanjay Dutt  ·  HR Reviewing  ·  Stage 1 done (employee said NO)
    // ============================================================
    {
        _id: 'exit_002',
        empId: '1016',
        name: 'Sanjay Dutt',
        email: 'sanjay@marutiflex.com',
        phone: '+91 98765 43225',
        branch: 'Bangalore',
        location: 'Koramangala',
        department: 'Marketing',
        division: 'Services',
        designation: 'Content Writer',
        reportingManager: 'Pooja Bhatt',
        reportingManagerContact: '+91 98765 40015',
        divisionHead: 'Priya Sharma',
        divisionHeadContact: '+91 98765 40001',

        resignationDate: '2025-09-10',
        lastWorkingDate: '2025-10-10',
        reason: 'Personal reasons',
        noticePeriod: '30 days',
        removalType: 'Resigned',

        status: 'HR Reviewing',

        stage1: {
            employeeAcceptedWithdrawal: 'No',
            remarks: 'Employee wishes to proceed with exit',
            emailScreenshot: null,
            submittedAt: '2025-09-12T10:30:00Z',
        },
        stage2: null,
        stage3: null,
        stage4: null,
        stage5: null,
    },

    // ============================================================
    // 3 — Gopal Krishnan  ·  F&F Initiated  ·  Stages 1+2 done
    // ============================================================
    {
        _id: 'exit_003',
        empId: '1018',
        name: 'Gopal Krishnan',
        email: 'gopal@marutiflex.com',
        phone: '+91 98765 43227',
        branch: 'Mangalore',
        location: 'Hampankatta',
        department: 'Operations',
        division: 'Services',
        designation: 'Operations Executive',
        reportingManager: 'Suresh Nair',
        reportingManagerContact: '+91 98765 40006',
        divisionHead: 'Priya Sharma',
        divisionHeadContact: '+91 98765 40001',

        resignationDate: '2025-08-25',
        lastWorkingDate: '2025-09-25',
        reason: 'Relocating to another city',
        noticePeriod: '30 days',
        removalType: 'Resigned',

        status: 'F&F Initiated',

        stage1: {
            employeeAcceptedWithdrawal: 'No',
            remarks: 'Employee confirmed exit',
            emailScreenshot: null,
            submittedAt: '2025-08-28T11:00:00Z',
        },
        stage2: {
            sendFNF: 'Yes',
            feedbackAboutEmployee: 'Consistent performer, will be missed',
            lastWorkingDate: '2025-09-25',
            dateOfFNF: '2025-10-10',
            submittedAt: '2025-08-30T15:20:00Z',
        },
        stage3: null,
        stage4: null,
        stage5: null,
    },

    // ============================================================
    // 4 — Divya Menon  ·  F&F Pending  ·  Stages 1+2+3 done
    // ============================================================
    {
        _id: 'exit_004',
        empId: '1021',
        name: 'Divya Menon',
        email: 'divya@marutiflex.com',
        phone: '+91 98765 43230',
        branch: 'Bangalore',
        location: 'Whitefield',
        department: 'Engineering',
        division: 'Product',
        designation: 'Senior Developer',
        reportingManager: 'Vikram Singh',
        reportingManagerContact: '+91 98765 40007',
        divisionHead: 'Priya Sharma',
        divisionHeadContact: '+91 98765 40001',

        resignationDate: '2025-09-01',
        lastWorkingDate: '2025-10-01',
        reason: 'Pursuing higher studies',
        noticePeriod: '30 days',
        removalType: 'Resigned',

        status: 'F&F Pending',

        stage1: {
            employeeAcceptedWithdrawal: 'No',
            remarks: 'Employee pursuing higher studies',
            emailScreenshot: null,
            submittedAt: '2025-09-03T09:15:00Z',
        },
        stage2: {
            sendFNF: 'Yes',
            feedbackAboutEmployee: 'Excellent technical skills and team player',
            lastWorkingDate: '2025-10-01',
            dateOfFNF: '2025-10-15',
            submittedAt: '2025-09-05T14:40:00Z',
        },
        stage3: {
            preventDepartureAnswer: 'Higher compensation and remote work options',
            likedMost: 'The collaborative team culture and learning opportunities',
            likedLeast: 'Long working hours during release cycles',
            dutiesMetExpectations: 'Yes',
            reportingManagerRatings: {
                recognition: 4,
                regularFeedback: 4,
                promptResolutions: 3,
                equitableTreatment: 4,
                knowledgeUpgrade: 5,
                encouragedFeedback: 4,
                providedLeadership: 4,
            },
            companyRatings: {
                performanceReviewSystem: 4,
                inductionProgram: 4,
                payRate: 3,
                careerDevelopment: 4,
                workEnvironment: 4,
                sensitiveToNeeds: 4,
                administration: 4,
                duties: 4,
                benefits: 3,
                employeeInforming: 4,
                fairTreatment: 4,
                cooperation: 5,
                recommendation: 4,
            },
            newCompanyAttraction: 'Higher pay and better work-life balance',
            suggestions: 'Consider flexible working hours and remote options',
            remarks: 'Thank you for the wonderful journey',
            removedFromWhatsappGroup: 'Yes',
            submittedAt: '2025-09-08T16:00:00Z',
        },
        stage4: null,
        stage5: null,
    },

    // ============================================================
    // 5 — Rohan Sharma  ·  No Due Cleared  ·  Stages 1-4 done
    // ============================================================
    {
        _id: 'exit_005',
        empId: '1022',
        name: 'Rohan Sharma',
        email: 'rohan@marutiflex.com',
        phone: '+91 98765 43231',
        branch: 'Ranchi',
        location: 'Main Road',
        department: 'Sales',
        division: 'Services',
        designation: 'Sales Executive',
        reportingManager: 'Karthik Menon',
        reportingManagerContact: '+91 98765 40014',
        divisionHead: 'Priya Sharma',
        divisionHeadContact: '+91 98765 40001',

        resignationDate: '2025-08-15',
        lastWorkingDate: '2025-08-31',
        reason: 'Performance concerns',
        noticePeriod: 'Immediate',
        removalType: 'Terminated',

        status: 'No Due Cleared',

        stage1: {
            employeeAcceptedWithdrawal: 'No',
            remarks: 'Termination confirmed',
            emailScreenshot: null,
            submittedAt: '2025-08-17T10:00:00Z',
        },
        stage2: {
            sendFNF: 'Yes',
            feedbackAboutEmployee: 'Performance did not meet expectations',
            lastWorkingDate: '2025-08-31',
            dateOfFNF: '2025-09-15',
            submittedAt: '2025-08-20T11:30:00Z',
        },
        stage3: {
            preventDepartureAnswer: 'NA',
            likedMost: 'Supportive colleagues',
            likedLeast: 'Pressure of targets',
            dutiesMetExpectations: 'No',
            reportingManagerRatings: {
                recognition: 2,
                regularFeedback: 3,
                promptResolutions: 2,
                equitableTreatment: 3,
                knowledgeUpgrade: 2,
                encouragedFeedback: 3,
                providedLeadership: 3,
            },
            companyRatings: {
                performanceReviewSystem: 3,
                inductionProgram: 4,
                payRate: 3,
                careerDevelopment: 2,
                workEnvironment: 3,
                sensitiveToNeeds: 3,
                administration: 3,
                duties: 3,
                benefits: 3,
                employeeInforming: 3,
                fairTreatment: 3,
                cooperation: 4,
                recommendation: 3,
            },
            newCompanyAttraction: 'Better role fit',
            suggestions: 'Better training for new sales hires',
            remarks: 'Thank you',
            removedFromWhatsappGroup: 'Yes',
            submittedAt: '2025-08-25T14:00:00Z',
        },
        stage4: {
            noDueFormAttachments: [],
            dueStatus: 'All due Cleared',
            noDueRemarks: 'All equipment returned, no pending dues',
            submittedAt: '2025-09-10T12:00:00Z',
        },
        stage5: null,
    },

    // ============================================================
    // 6 — Pooja Reddy  ·  Exited  ·  All 5 stages done
    // ============================================================
    {
        _id: 'exit_006',
        empId: '1023',
        name: 'Pooja Reddy',
        email: 'pooja.reddy@marutiflex.com',
        phone: '+91 98765 43232',
        branch: 'Mangalore',
        location: 'Kadri',
        department: 'Finance',
        division: 'Corporate',
        designation: 'Accountant',
        reportingManager: 'Ravi Kumar',
        reportingManagerContact: '+91 98765 40012',
        divisionHead: 'Priya Sharma',
        divisionHeadContact: '+91 98765 40001',

        resignationDate: '2025-07-01',
        lastWorkingDate: '2025-08-30',
        reason: 'Personal reasons',
        noticePeriod: '60 days',
        removalType: 'Resigned',

        status: 'Exited',

        stage1: {
            employeeAcceptedWithdrawal: 'No',
            remarks: 'Employee confirmed exit due to personal reasons',
            emailScreenshot: null,
            submittedAt: '2025-07-03T09:30:00Z',
        },
        stage2: {
            sendFNF: 'Yes',
            feedbackAboutEmployee: 'Reliable and diligent team member',
            lastWorkingDate: '2025-08-30',
            dateOfFNF: '2025-09-15',
            submittedAt: '2025-07-05T11:15:00Z',
        },
        stage3: {
            preventDepartureAnswer: 'NA',
            likedMost: 'Work-life balance and team support',
            likedLeast: 'Limited growth opportunities',
            dutiesMetExpectations: 'Yes',
            reportingManagerRatings: {
                recognition: 4,
                regularFeedback: 4,
                promptResolutions: 5,
                equitableTreatment: 4,
                knowledgeUpgrade: 3,
                encouragedFeedback: 4,
                providedLeadership: 4,
            },
            companyRatings: {
                performanceReviewSystem: 3,
                inductionProgram: 4,
                payRate: 4,
                careerDevelopment: 3,
                workEnvironment: 5,
                sensitiveToNeeds: 4,
                administration: 4,
                duties: 4,
                benefits: 4,
                employeeInforming: 4,
                fairTreatment: 5,
                cooperation: 5,
                recommendation: 4,
            },
            newCompanyAttraction: 'Better career growth',
            suggestions: 'More internal training programs',
            remarks: 'Enjoyed working here',
            removedFromWhatsappGroup: 'Yes',
            submittedAt: '2025-07-10T15:30:00Z',
        },
        stage4: {
            noDueFormAttachments: [],
            dueStatus: 'All due Cleared',
            noDueRemarks: 'All dues cleared',
            submittedAt: '2025-08-20T10:00:00Z',
        },
        stage5: {
            generateFNF: 'Yes',
            remarks: 'Full and final settlement processed',
            generateLetters: 'Yes',
            lastMonthPayslip: null,
            secondLastMonthPayslip: null,
            thirdLastMonthPayslip: null,
            submittedAt: '2025-09-15T16:00:00Z',
        },
    },
]

export const EXIT_FILTER_OPTIONS = {
    branch: ['All', 'Bangalore', 'Mangalore', 'Ranchi'],
    department: ['All', 'Information Technology', 'Operations', 'Management', 'Human Resources', 'Engineering', 'Finance', 'Sales', 'Marketing'],
    status: ['All', 'Pending HR', 'HR Reviewing', 'F&F Initiated', 'F&F Pending', 'No Due Cleared', 'Withdrawn', 'Exited'],
    removalType: ['All', 'Resigned', 'Terminated', 'Absconded', 'Terminated Based on PIP'],
}