# AI-Powered Multilingual Mass Communication Platform

An enterprise-grade, full-stack platform designed for public administration, civic awareness, and mass emergency advisories. The platform empowers cross-functional teams to draft, translate into 8+ Indian regional languages, review, approve, and distribute verified announcements across WhatsApp, SMS, Email, and Push notifications.

---

## Architecture & Core Capabilities

- **Role-Based Access Control (RBAC):**
  - **Administrator:** System oversight, user and manager provisioning, review queue approvals, regional analytics, channel gateway settings.
  - **Campaign Manager:** Campaign drafting, target audience selection, multi-segment filtering, template library management, and report generation.
  - **Communication Team:** Review queue verification, multi-channel distribution execution (WhatsApp, SMS, Email), delivery telemetry monitoring, and feedback collection.
- **Multilingual AI Content Engine:**
  - Automated message adaptation and tone refinement powered by Google Gemini API.
  - Native support for 8 Indian regional languages: English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Marathi (मराठी), and Bengali (বাংলা).
- **Human-in-the-Loop Governance:**
  - Mandatory administrative and communications review queue before public dissemination.
  - Append-only audit logging and campaign state machine (`DRAFT` &rarr; `PENDING_APPROVAL` &rarr; `APPROVED` &rarr; `DISTRIBUTING` &rarr; `COMPLETED`).
- **Telemetry & Regional Insights:**
  - Provider-reported delivery confirmation (Delivered, Failed, Queued).
  - Voice of the Community feedback tracking and sentiment classification (Positive, Neutral, Negative).

---

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Tooling & Bundler:** Vite
- **Styling:** Tailwind CSS (White and Green Civic Palette, Dark Forest Green Sidebar `#0a2018`)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Routing:** React Router v6 with Role Guard protection

### Backend & Database
- **Framework:** Python FastAPI
- **Database:** PostgreSQL 18 (with SQLAlchemy ORM)
- **Security:** JWT Authentication (HS256) with password hashing (bcrypt)
- **Validation:** Pydantic v2
- **Testing:** Pytest with full async and transactional fixtures

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- PostgreSQL 18

### 1. Database Setup
Ensure PostgreSQL is running locally, then create the database:
```sql
CREATE DATABASE ai_platform;
```

### 2. Backend Configuration & Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the environment configuration template:
   ```bash
   copy .env.example .env
   ```
3. Update `.env` with your PostgreSQL database credentials and optional AI API keys:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/ai_platform"
   GEMINI_API_KEY="your-gemini-api-key"
   ```
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the backend server from the project root:
   ```bash
   python run_backend.py
   ```
   - API Docs will be available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   - Web Application will be available at: `http://localhost:5173`

---

## Demo Credentials

| Role | Email | Password | Default Redirect |
|---|---|---|---|
| **Administrator** | `admin@example.com` | `vtu23012` | `/admin/dashboard` |
| **Campaign Manager** | `manager@example.com` | `vtu23012` | `/manager/dashboard` |
| **Communication Team** | `comm@example.com` | `vtu23012` | `/comm/dashboard` |

---

## Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular API endpoints (auth, campaigns, audiences, analytics, etc.)
│   │   ├── core/            # Security, JWT tokens, RBAC permissions
│   │   ├── database/        # Session engine and base declarative models
│   │   ├── models/          # 24 SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── services/        # AI content engines and external communication adapters
│   ├── tests/               # Pytest suite
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components and layouts
│   │   ├── context/         # AuthContext with token persistence
│   │   ├── layouts/         # AdminLayout, ManagerLayout, CommunicationLayout
│   │   ├── pages/           # Admin, Manager, Communication, and Auth pages
│   │   ├── routes/          # AppRoutes with RoleGuard protection
│   │   ├── services/        # Axios API client
│   │   └── types/           # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── run_backend.py           # Unified backend runner
├── .gitignore
└── README.md
```

---

## License

This project is licensed under the MIT License.
