# 📋 HireFlow AI — Master Testing Checklist

Use this checklist to verify each module and workflow step when testing locally (`npm run dev` at [http://localhost:3000](http://localhost:3000)).

---

## 🛠️ Pre-Flight Setup & Environment

- [ ] **Node.js Environment**: Verify dependencies are installed (`npm install`).
- [ ] **Environment File (.env)**:
  - [ ] `NEXTAUTH_URL="http://localhost:3000"`
  - [ ] `NEXTAUTH_SECRET` (configured with a secret key)
  - [ ] `GEMINI_API_KEY` (configured from Google Cloud / Google AI Studio)
  - [ ] `DATABASE_URL` (optional for local testing with fallback; required for PostgreSQL sync)
  - [ ] `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (configured from Google Cloud Console for real Google Login)
- [ ] **Database Migration** (if using live PostgreSQL/Neon):
  - [ ] Run `npx prisma db push` to generate tables.

---

## 1. 🔐 Phase 1: Authentication & Portal Isolation

### Public & Navigation
- [ ] **Landing Page**: Visit [http://localhost:3000](http://localhost:3000). Verify 7-step workflow cards and navbar links.
- [ ] **Role Protection Middleware**:
  - [ ] Visit [http://localhost:3000/hr/dashboard](http://localhost:3000/hr/dashboard) while unauthenticated. Verify redirect to `/hr/login`.
  - [ ] Visit [http://localhost:3000/candidate/dashboard](http://localhost:3000/candidate/dashboard) while unauthenticated. Verify redirect to `/candidate/login`.

### Candidate Sign-In
- [ ] Open [http://localhost:3000/candidate/login](http://localhost:3000/candidate/login).
- [ ] Test **"Continue with Google"** (if credentials provided) or click **"Fast Demo Login as Candidate"**.
- [ ] Verify successful redirection to `/candidate/dashboard`.
- [ ] Verify candidate badge appears in the top navigation bar.

### HR Recruiter Sign-In
- [ ] Open [http://localhost:3000/hr/login](http://localhost:3000/hr/login).
- [ ] Test **"Sign in with Google Work Account"** or click **"Fast Demo Login as HR Recruiter"**.
- [ ] Verify successful redirection to `/hr/dashboard`.
- [ ] Verify "HR" badge appears in navigation bar.

---

## 2. 📝 Phase 2: Job Description Management & Applications

### HR Job Creation
- [ ] Go to [http://localhost:3000/hr/jobs/new](http://localhost:3000/hr/jobs/new).
- [ ] Enter a Job Title (e.g., *"Lead Cloud Architect"*).
- [ ] Select Department, Location (*Remote*), Min Experience (*5 years*), and Salary Range (*$130k - $170k*).
- [ ] **Gemini AI JD Generator**:
  - [ ] In the AI box, type rough notes (e.g., *"Must know Kubernetes, Terraform, and PostgreSQL"*).
  - [ ] Click **"Generate & Enhance with AI"**.
  - [ ] Verify description is populated in Markdown.
  - [ ] Verify Required and Preferred Skill tags are automatically generated.
- [ ] **Interactive Tag Manager**:
  - [ ] Type a custom skill (e.g., *"Docker"*) and press `Enter` or click "Add".
  - [ ] Remove a skill tag by clicking `✕`.
- [ ] Click **"Publish Job Posting"**.
- [ ] Verify the job appears in [http://localhost:3000/hr/jobs](http://localhost:3000/hr/jobs).

### Public Job Board & Application
- [ ] Open [http://localhost:3000/jobs](http://localhost:3000/jobs).
- [ ] Test keyword search bar (type *"Engineering"* or *"React"*).
- [ ] Test department filter pills (*All*, *Engineering*, *AI Research*, *Design*).
- [ ] Click **"View Details & Apply"** on any job posting (e.g. `/jobs/job-1`).
- [ ] On the job details page, verify requirements, salary, and skills badges.
- [ ] Click **"Apply for this Position"**:
  - [ ] Fill in Name, Email, Phone, and Portfolio URL.
  - [ ] Upload a resume file (`.pdf` or `.docx`).
  - [ ] Click **"Submit Application"**.
  - [ ] Verify success modal confirms receipt and provides a link to Candidate Dashboard.

---

## 3. 🤖 Phase 3: AI Resume Screening & Candidate Ranking

- [ ] Open [http://localhost:3000/hr/candidates](http://localhost:3000/hr/candidates).
- [ ] Verify candidates are ranked in descending order by AI Match Score.
- [ ] Test filters:
  - [ ] Filter by Target Role dropdown.
  - [ ] Filter by Status (*Applied*, *Screened*, *Shortlisted*).
  - [ ] Filter by Min Match Score (*70%+*, *80%+*, *90%+*).
- [ ] **On-Demand AI Screening**:
  - [ ] Locate an unscreened candidate (or *Carlos Mendez*).
  - [ ] Click **"Screen with AI"**.
  - [ ] Verify the spinner activates and Gemini parses the resume against the job description.
- [ ] **AI Diagnostics Modal**:
  - [ ] Click **"AI Diagnostics"** on any candidate card.
  - [ ] Verify **Match Score** gauge (e.g., 94% Excellent).
  - [ ] Verify **Matched Skills** (green badges) vs **Missing / Unverified Skills** (amber badges).
  - [ ] Verify Gemini **Candidate Strengths** and **Areas to Investigate in Interview**.
  - [ ] Verify **Gemini Executive Evaluation Verdict**.
  - [ ] Click **"Approve for Online Assessment"** and verify status updates to `ASSESSMENT_PENDING`.

---

## 4. 🛡️ Phase 4: Online Assessments & Online Proctoring

### Pre-Test Check
- [ ] Open [http://localhost:3000/candidate/assessments/test-1](http://localhost:3000/candidate/assessments/test-1).
- [ ] Verify exam details: Title, Duration (15 minutes), Passing Score (60%).
- [ ] Verify webcam preview initiates.
- [ ] Click **"Accept Guidelines & Start Test"**.

### Active Proctored Examination Room
- [ ] Verify browser requests / switches to fullscreen mode.
- [ ] Verify live countdown timer starts at 15:00.
- [ ] Verify the floating webcam feed appears in the corner with a pulsing **"AI Proctor Active"** badge.
- [ ] **Anti-Cheat Telemetry Tests**:
  - [ ] **Tab Switch**: Switch to another tab for 2 seconds and switch back. Verify the top alert triggers: *"WARNING: Tab switch detected!"* and deducts integrity points.
  - [ ] **Copy/Paste Prevention**: Attempt to copy (`Cmd+C` or right click) any question text. Verify copy is blocked and flagged.
- [ ] Answer questions (A, B, C, D) and click **"Next Question"**.
- [ ] On Question 5, click **"Submit Assessment"**.

### Instant Grading & HR Audit View
- [ ] Verify post-test screen displays:
  - [ ] Test Score percentage (e.g. 80%) & Pass/Fail status.
  - [ ] Proctor Integrity Trust Score (e.g. 85%).
- [ ] **HR Audit View**:
  - [ ] Open [http://localhost:3000/hr/assessments/test-1](http://localhost:3000/hr/assessments/test-1).
  - [ ] Review each question with candidate's choice vs correct answer and explanation.
  - [ ] Review the **Chronological Proctoring Audit Log** displaying exact timestamps of any tab switches or fullscreen exits.

---

## 5. 🎙️ Phase 5: Interview Management & AI Co-Pilot

### Schedule Interview
- [ ] Open [http://localhost:3000/hr/interviews](http://localhost:3000/hr/interviews).
- [ ] Click **"Schedule New Interview"**.
- [ ] Select candidate, interviewer name, date, time, and Google Meet link.
- [ ] Click **"Confirm & Generate Co-Pilot Prompts"**.

### Live Interview Co-Pilot Workspace
- [ ] Open [http://localhost:3000/hr/interviews/int-1](http://localhost:3000/hr/interviews/int-1).
- [ ] Verify **AI Tailored Question Prompts** generated by Gemini:
  - [ ] *Technical Deep-Dive*
  - [ ] *Resume Gap Verification* (explains why AI flagged this specific question)
  - [ ] *Problem Solving & Incident Debugging*
  - [ ] *Behavioral & Team Culture*
- [ ] **Interactive Competency Scorecard**:
  - [ ] Rate 1 to 5 stars on Technical Depth, Problem Solving, Communication, and Culture Fit.
  - [ ] Select recommendation pill: `STRONG_HIRE`, `HIRE`, `HOLD`, or `REJECT`.
  - [ ] Enter interview notes and observations.
  - [ ] Click **"Submit Scorecard"**.
  - [ ] Verify candidate is advanced to `HR_REVIEW` stage.

---

## 6. 📜 Phase 6: Human HR Approval & Digital Offer Letters

### HR Approval Screen
- [ ] Open [http://localhost:3000/hr/approvals](http://localhost:3000/hr/approvals).
- [ ] Under **"Candidates Ready for Final Offer Approval"**, verify candidate lifecycle summary (Resume Match %, Assessment %, Interview rating).
- [ ] Click **"Approve & Issue Offer"**:
  - [ ] Verify/edit Official Designation, Base Salary (e.g. `$145,000`), Start Date, and Expiration Date.
  - [ ] Click **"Approve & Dispatch Offer"**.
  - [ ] Verify offer appears in the **Active Offer Letters** table with status `SENT`.

### Candidate e-Signature Portal
- [ ] Open [http://localhost:3000/candidate/offers/offer-1](http://localhost:3000/candidate/offers/offer-1).
- [ ] Verify company letterhead, formal offer text, compensation breakdown, and benefits list.
- [ ] **HTML5 Canvas Signature Pad**:
  - [ ] Draw signature with trackpad/mouse.
  - [ ] Test the **"Clear"** button to redraw.
  - [ ] Check the acknowledgment checkbox.
  - [ ] Click **"Accept Offer & Proceed to Onboarding"**.
  - [ ] Verify signed status badge appears with the digital signature on file!

---

## 7. 🚀 Phase 7: Employee Onboarding & Verification

### Candidate Onboarding Portal
- [ ] Open [http://localhost:3000/candidate/onboarding](http://localhost:3000/candidate/onboarding).
- [ ] Verify official **Employee ID badge** (e.g. `EMP-2026-042`) and start date.
- [ ] **Document Upload**:
  - [ ] Click **"Upload File"** on *Government Passport / Photo ID* or *Tax Withholding*.
  - [ ] Select a file and verify the automated AI verification note generates.
- [ ] **Interactive Orientation Checklist**:
  - [ ] Click tasks (e.g., *Review IT Security Policy*, *Setup GitHub Access*).
  - [ ] Verify tasks cross out and the progress bar animates towards 100%!

### HR Onboarding Verification Hub
- [ ] Open [http://localhost:3000/hr/onboarding](http://localhost:3000/hr/onboarding).
- [ ] Select a new hire from the sidebar.
- [ ] Review submitted documents and click **"Approve Document"** or **"Reject"**.

---

## 8. 📊 Phase 8: Recruiter Funnel Analytics

- [ ] Open [http://localhost:3000/hr/dashboard](http://localhost:3000/hr/dashboard).
- [ ] Inspect the **Recruitment & Onboarding Lifecycle Funnel** card:
  - [ ] Verify volume counts across all 7 stages: *1. Jobs &rarr; 2. Screened &rarr; 3. Assessed &rarr; 4. Interview &rarr; 5. Approved &rarr; 6. Offers &rarr; 7. Onboard*.
- [ ] Inspect the 4 top metric cards (*Active Openings, Screened Resumes, Proctored Tests, Pending Approvals*).

