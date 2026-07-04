# 🌍 BharatAI — Apna AI, Apna Haq

> **Tagline:** AI for every Indian, in every village, for every dream.

BharatAI is a single, premium web super-app tailored specifically to address the unique challenges faced by rural communities across India. It aggregates **7 distinct modular portals** under one responsive shell, featuring localized database systems, translation layers, offline queue synchronization, accessibility modes, and an **Expert AI Diagnostic System**.

Live URL: **[BharatAI Web Portal on Vercel](https://bharat-l3ke1qs84-swaybytes-projects.vercel.app)**

---

## 🌟 Core App Capabilities

### 🎤 Accessibility First
* **Speech-to-Text Voice Input**: Click the microphone icon 🎤 to dictate symptoms, questions, or requests in regional languages.
* **Text-to-Speech Read Aloud**: Reads any AI advice or crop health diagnostic aloud in natural accents.
* **Accessibility Settings**: Easily toggle between High Contrast mode, Large Font mode, and Low Data mode (for slow 2G/3G connectivity).
* **Multilingual Toggle**: Supports translation templates in English and Hindi, plus custom advisory responses in **Odia, Bengali, Tamil, Telugu, Marathi, Gujarati, and Punjabi**.

### 🔄 Offline Sync Architecture
* If internet connectivity drops, user entries (ledger records, notices, job applications) are cached locally.
* A warning banner tracks pending actions. Upon reconnecting, data is synchronized automatically with Supabase tables.

---

## 📦 The 7 Portal Modules

### 1. 🌱 KisanAI (Farmers)
* **AI Crop Doctor**: Crop disease recognition and pesticide formulation generator with organic alternate remedies.
* **Cost-Profit Calculator**: Estimate seasonal crop sales revenue vs fertilizer/seeds and labor costs.
* **Live Mandi Chart**: Graphical crop price trends over the last 6 months.
* **Insurance Checker**: Verify eligibility status for PM Fasal Bima Yojana.

### 2. 🎓 SkillBridge (Students)
* **IIT/ISRO Mentors**: Book sessions or consult curriculum specialists.
* **Career Roadmaps**: Detailed roadmaps for frontend developers, dairy supervisors, and clerk positions.
* **Study Quiz**: Interactive quizzes covering digital literacy and history.
* **Daily Streaks**: GitHub-style streak grids tracking daily check-ins.

### 3. 🏥 HealthGuide (Health Care)
* **Symptom Severity Rating**: Classifies symptoms into Urgent, Standard Care, or Home Remediation.
* **Maternal Advisor**: Slide through pregnancy weeks (1-40) for vaccination timelines and nutritional checkups.
* **WHO Growth Standards**: Compare infant age, weight, and height against national curves.
* **Jan Aushadhi Store Locator**: Locate generic medicines.

### 4. 💼 RozgarAI (Jobs Board)
* **Rural Job Openings**: Find local MGNREGA projects or remote data entry supervisor jobs.
* **AI Resume & Cover Letter Builder**: Create a CV in under 30 seconds.
* **Mock Interviews**: Interactive chat panels conducting interviews.

### 5. 🏪 DukaanAI (Small Business)
* **Digital Ledger Book**: Track credits, income, and expenses with profit charts.
* **GST Compliant Invoicing**: Output receipts with 18% CGST/SGST and print layouts.
* **Shop Logo Designer**: Design and download customized shop logos as PNG files.

### 6. 👩 ShaktiAI (Women Empowerment)
* **SHG Registrar**: Manage self-help group rosters, savings balances, and DAY-NRLM schemes.
* **Emergency SOS Console**: Pinpoints coordinates and dispatches SMS alerts.
* **Menstrual Tracker**: Monitor cycles anonymously.

### 7. 🌐 SamajAI (Community Notices)
* **Village Board**: Public announcements and classified listings.
* **Civic Services**: Draft formal **RTI (Right to Information)** templates and matches PM welfare schemes.

---

## 🛠️ Technology Stack
* **UI/Styles**: Tailwind CSS CDN, Lucide Icons, Google Fonts
* **Charts**: Chart.js
* **Backend Integration**: Supabase (REST APIs) & Local Storage
* **AI Model Engine**: Rule-Based Expert AI Parser (local fallback) & Claude 3.5 Sonnet (API configurable)
* **Safety Dispatcher**: Resend Mail API
