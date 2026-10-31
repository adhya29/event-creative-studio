# Lumina Creative Studio — Event Photography & Creative Services

An editorial-grade, full-stack web application and administrative command center built for an **Event Photography & Creative Services** studio. 

Designed based on the **Frame&Story Editorial Design Board**, featuring high-contrast deep burgundy canvas (`#650A08`), warm cream containers (`#FFF8D1`), electric green accents (`#39FF88`), bold Anton typography, DM Serif Text editorial narrative, and tilted polaroid photo frames.

---

## 📸 Core Business Services

1. **Event Photography:** Multi-camera candid coverage, stage speeches, and heirloom albums.
2. **Event Management:** End-to-end festival & wedding coordination, stage architecture, acoustics & lighting.
3. **Banner Design & Printing:** Large-format star flex, exhibition backdrops, and roll-up standees.
4. **ID Card Systems:** 800-micron thermal gloss/matte PVC badges and custom satin lanyards.
5. **Visiting Cards:** 450 GSM velvet matte, gold hot foil, raised Spot UV, and contactless smart NFC cards.
6. **Graphic Design:** Brand identity suites, marketing brochures, and promotional collateral.

---

## 🛠️ Strict Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7.
- **Backend:** Node.js, Express.js REST API with modular architecture (Routes, Controllers, Middleware, Validation).
- **Database:** Supabase PostgreSQL with complete migrations (`supabase/schema.sql`), Row-Level Security (RLS) policies, triggers, and comprehensive seed data.
- **Storage:** Dual-mode asset handler (Supabase Storage bucket `studio-media` with local static fallback).
- **Authentication:** Admin JWT authorization with Supabase Auth session integration and role verification.
- **Deployment:** Vercel for frontend (`client/vercel.json`), Render for backend (`render.yaml`).
- **Version Control:** Git repository with clean commits.

---

## 🌟 Key Application Features

### 1. Public Creative Experience
- **Editorial Homepage:** Distinctive hero section with headline, editorial subheading, tilted polaroid hero image, quick statistics, creative philosophy, core services overview, selected portfolio showcase, 4-stage process, and quotation CTA banner.
- **Services Catalog (`/services`):** Dynamic catalog of all 6 services with category filtering, investment indicators, turnaround times, and deliverables checklist.
- **Service Detail Page (`/services/:slug`):** Deep-dive page with comprehensive technical scope, deliverables breakdown, and one-click prefilled quotation requests.
- **Filterable Portfolio & Lightbox (`/portfolio`):** Asymmetric editorial photo grid with category filters and full-screen dark modal lightbox with metadata and keyboard shortcuts (`Esc`).
- **General Contact & WhatsApp (`/contact`):** Validated enquiry form saving directly to the database, studio contact information, and one-click WhatsApp chat desk with prefilled message.
- **Event Quotation Pipeline (`/quotation`):** Multi-service selection, event dates, venue city, budget estimation, and instant WhatsApp quote generator.

### 2. Administrative Command Center (`/admin`)
- **Protected Security:** Admin route protection, JWT bearer token verification, unauthorized access prevention.
- **Operational Dashboard (`/admin`):** Real-time KPI metrics (Total Enquiries, Pending Enquiries, Total Quotations, Active Services, Live Portfolio Items) and recent activity stream.
- **Service Management (`/admin/services`):** Full CRUD — create, edit, delete, publish/unpublish, and upload service imagery.
- **Portfolio Management (`/admin/portfolio`):** Full CRUD — image uploads, client credits, event dates, category assignment, and homepage feature toggle.
- **Enquiry Management (`/admin/enquiries`):** Filter by status (`new`, `in_progress`, `contacted`, `closed`), view complete lead details, update status, and attach internal staff notes.
- **Quotation Pipeline (`/admin/quotations`):** Detailed event requirements review, status progression (`pending`, `reviewed`, `quoted`, `accepted`, `declined`), and internal notes.
- **Website Content Customizer (`/admin/content`):** Live editing of company name, tagline, phone, email, WhatsApp number, physical address, hero display text, and about story narrative. Changes persist in the database and update across the public website immediately.

---

## 📂 Folder Structure

```
event-creative-studio/
├── client/                     # Frontend Application (React + TS + Vite + Tailwind)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProtectedRoute, ScrollToTop
│   │   ├── context/            # ContentContext (Branding), AuthContext (Admin)
│   │   ├── pages/
│   │   │   ├── Home.tsx        # Editorial Homepage
│   │   │   ├── About.tsx       # Studio Narrative & Ethos
│   │   │   ├── Services.tsx    # 6-Service Overview & Filters
│   │   │   ├── ServiceDetail.tsx # In-depth Service Scope
│   │   │   ├── Portfolio.tsx   # Filterable Gallery with Lightbox
│   │   │   ├── Contact.tsx     # General Enquiry & WhatsApp
│   │   │   ├── Quotation.tsx   # Bespoke Event Quotation Form
│   │   │   └── admin/          # Admin Portal Screens
│   │   │       ├── AdminLayout.tsx
│   │   │       ├── AdminLogin.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminServices.tsx
│   │   │       ├── AdminPortfolio.tsx
│   │   │       ├── AdminEnquiries.tsx
│   │   │       ├── AdminQuotations.tsx
│   │   │       └── AdminContent.tsx
│   │   ├── services/           # api.ts (REST client)
│   │   ├── App.tsx             # Application Router
│   │   ├── index.css           # Design tokens, fonts, polaroid frames
│   │   └── main.tsx            # React root mount
│   ├── tailwind.config.js      # Palette: Burgundy, Cream, Electric Green
│   ├── vercel.json             # Vercel deployment SPA rewrites
│   └── package.json
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Environment variable loader
│   │   ├── db/
│   │   │   ├── index.js        # Dual-mode database driver (Supabase + Local fallback)
│   │   │   └── initialSeed.js  # Rich initial seed data
│   │   ├── middleware/         # auth.js (JWT verify), upload.js (Multer)
│   │   ├── routes/             # REST API modular routes
│   │   └── server.js           # Express app, CORS, error handling
│   ├── test/                   # Automated E2E verification suite
│   ├── uploads/                # Local uploaded asset storage
│   ├── .env.example            # Backend environment template
│   └── package.json
│
├── supabase/
│   └── schema.sql              # Complete PostgreSQL DDL, RLS, Indexes, Triggers
├── render.yaml                 # Render backend deployment blueprint
├── package.json                # Root concurrent runner scripts
└── README.md                   # Complete system documentation
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js v18+ (tested on Node.js v26 LTS)
- npm v9+

### 1. Clone Repository & Install Dependencies
```bash
git clone <repository-url>
cd event-creative-studio

# Install root orchestrator dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Environment Configuration

#### Backend (`server/.env`):
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Credentials (optional for dev; system runs local persistent engine if empty)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=studio-media

# Admin Credentials
ADMIN_JWT_SECRET=lumina-studio-secret-key-super-secure-2026
ADMIN_EMAIL=admin@luminacreative.studio
ADMIN_DEFAULT_PASSWORD=AdminStudio@2026
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers
From the root directory:
```bash
npm run dev
```
- **Public Website:** `http://localhost:5173`
- **Admin Panel:** `http://localhost:5173/admin`
- **Express REST API:** `http://localhost:5000`
- **API Health Check:** `http://localhost:5000/api/health`

---

## 🗄️ Supabase Database Setup

### Verified Project Details
- **Project Name:** `lumina-creative-studio`
- **Project URL:** `https://jgfkaahqitncvmdotxgg.supabase.co`
- **Region:** West EU (Paris) / `eu-west-3`
- **Compute Tier:** Nano
- **Organization:** adhyasri Org

---

### Step 1: Open Your Existing Supabase Project
1. Log in to your account at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Select your existing project: **`lumina-creative-studio`**.

### Step 2: Run the Database Schema (All 7 Tables + RLS + Storage)
1. In the Supabase Dashboard left sidebar, click **SQL Editor** (icon with `>_`).
2. Click **New query** (top left).
3. Open the file `supabase/schema.sql` from this repository on your computer.
4. Select all contents (`Ctrl+A`), copy (`Ctrl+C`), and paste into the Supabase SQL Editor.
5. Click **Run** (green button or `Ctrl+Enter`).
6. You will see: `Success. No rows returned.`
7. This automatically creates:
   - All 7 tables (`admins`, `services`, `portfolio_categories`, `portfolio_items`, `enquiries`, `quotation_requests`, `website_content`)
   - All 13 performance indexes
   - Automatic `updated_at` triggers
   - Strict Row-Level Security (RLS) policies protecting customer data
   - The secure `bootstrap_admin()` verification function
   - Canonical studio seed data
   - The `studio-media` Storage bucket with public read access and admin-only upload access

### Step 3: Copy Your API Credentials
1. In the left sidebar, click **Project Settings** (gear icon at the very bottom).
2. Click **API** under Configuration.
3. You will see your credentials:
   - **Project URL:** `https://jgfkaahqitncvmdotxgg.supabase.co`
   - **anon / public key:** Copy this token.
   - **service_role / secret key:** Click reveal and copy this token.
4. Paste these values into your `server/.env` file:
```env
SUPABASE_URL=https://jgfkaahqitncvmdotxgg.supabase.co
SUPABASE_ANON_KEY=your_copied_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_copied_service_role_key
SUPABASE_STORAGE_BUCKET=studio-media
```
> ⚠️ **CRITICAL SECURITY RULE:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS and must be kept strictly on the backend. Never commit it to GitHub or expose it in frontend code.

### Step 4: Create Your Administrator Account

The database strictly requires every administrator to be linked to a genuine Supabase Auth user UUID. Follow these two simple steps:

#### 4a. Create the User in Supabase Authentication
1. In the left sidebar, click **Authentication** (icon with users).
2. Click **Add user** > **Create new user**.
3. Enter your preferred administrator email (e.g. `admin@luminacreative.studio`) and a strong password.
4. Toggle "Auto Confirm User?" to **ON** (so email confirmation is not required).
5. Click **Create user**.
6. Find the newly created user in the list and click on it.
7. Copy the **User UID** (a UUID like `e3b0c442-98fc-1c14-9af0-2b901a0e0000`).

#### 4b. Provision Administrator Privileges via SQL Editor
1. Return to **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Run the following command (substitute your real UUID and email):
```sql
SELECT bootstrap_admin(
  'PASTE_YOUR_COPIED_UUID_HERE'::uuid,
  'your_admin_email_here@domain.com',
  'Master Creative Director'
);
```
4. Click **Run**.
5. The function verifies that the UUID exists in `auth.users` and that the email matches. It activates the user with `super_admin` privileges.

### Step 5: Test Admin Login
1. Start your local servers: `npm run dev`
2. Navigate to `http://localhost:5173/admin`
3. Enter your Supabase Auth email and password.
4. You are securely logged in to the command center!

---

## Administrator Account and Login

Navigate to `/admin` or `/admin/login`.

**Local Development (without Supabase):**
- **Email:** `admin@luminacreative.studio`
- **Password:** `AdminStudio@2026`
- *(A one-click **"Auto-Fill Demo"** button is provided on the login screen for convenience.)*

**Production (with Supabase):**
- Use the email and password you created in Supabase Auth (Step 5a above).
- The admin must also be provisioned via `bootstrap_admin()` (Step 5b above).

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Backend health & database connection status |
| `GET` | `/api/content` | Public | Returns all website branding and copy |
| `PUT` | `/api/content/:id` | Admin | Updates branding/copy section |
| `GET` | `/api/services` | Public | Lists all published services |
| `GET` | `/api/services/all` | Admin | Lists all services (including drafts) |
| `GET` | `/api/services/:idOrSlug` | Public | Retrieves single service specification |
| `POST` | `/api/services` | Admin | Creates a new service record |
| `PUT` | `/api/services/:id` | Admin | Updates existing service |
| `DELETE` | `/api/services/:id` | Admin | Deletes service record |
| `GET` | `/api/portfolio/categories` | Public | Lists portfolio categories |
| `GET` | `/api/portfolio` | Public | Filterable portfolio list |
| `POST` | `/api/portfolio` | Admin | Adds new portfolio project |
| `PUT` | `/api/portfolio/:id` | Admin | Updates portfolio project |
| `DELETE` | `/api/portfolio/:id` | Admin | Deletes portfolio project |
| `POST` | `/api/enquiries` | Public | Submits customer contact enquiry |
| `GET` | `/api/enquiries` | Admin | Lists inquiries with status filter |
| `PATCH` | `/api/enquiries/:id/status`| Admin | Updates enquiry status & staff notes |
| `DELETE` | `/api/enquiries/:id` | Admin | Deletes enquiry record |
| `POST` | `/api/quotations` | Public | Submits event quotation request |
| `GET` | `/api/quotations` | Admin | Lists quotation requests |
| `PATCH` | `/api/quotations/:id/status`| Admin | Updates quotation status & staff notes |
| `DELETE` | `/api/quotations/:id` | Admin | Deletes quotation record |
| `POST` | `/api/upload` | Admin | Image upload (Supabase Storage / local) |
| `POST` | `/api/auth/login` | Public | Authenticates admin and returns JWT |
| `GET` | `/api/auth/verify` | Admin | Validates active session token |
| `GET` | `/api/admin/stats` | Admin | Returns operational KPI statistics |

---

## 🧪 Automated Testing Results

The project includes an end-to-end automated verification suite (`server/test/e2e_verification.js`):
```bash
node server/test/e2e_verification.js
```

### Results:
- ✅ Backend Health Check: **PASS**
- ✅ Public Services Catalog (6 core services): **PASS**
- ✅ Single Service Retrieval: **PASS**
- ✅ Portfolio & Categories Retrieval: **PASS**
- ✅ Website Content & Dynamic Branding: **PASS**
- ✅ Customer Enquiry Submission: **PASS**
- ✅ Customer Enquiry Validation Rejection: **PASS**
- ✅ Customer Event Quotation Submission: **PASS**
- ✅ Admin Authentication Login: **PASS**
- ✅ Admin Token Verification: **PASS**
- ✅ Protected Route Rejection on Missing Token (401): **PASS**
- ✅ Admin Dashboard KPIs & Metrics: **PASS**
- ✅ Service CRUD Workflow: **PASS**
- ✅ Enquiry Status Update & Internal Notes: **PASS**
- ✅ Quotation Status Progression & Notes: **PASS**
- ✅ Website Content Customization: **PASS**

**Result: 16 Passed, 0 Failed.**

---

## 🌐 Deployment Instructions

### 1. Frontend (Vercel)
1. Push repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repository.
3. Set **Root Directory** to `client`.
4. Framework Preset: **Vite**.
5. Add Environment Variable:
   - `VITE_API_URL`: Your deployed Express backend URL (e.g., `https://event-creative-studio-api.onrender.com/api`).
6. Click **Deploy**. Vercel will build the frontend using `client/vercel.json`.

### 2. Backend (Render)
1. In [Render Dashboard](https://render.com), click **New + > Web Service**.
2. Connect your GitHub repository.
3. Build Command: `cd server && npm install`
4. Start Command: `cd server && node src/server.js`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `FRONTEND_URL`: Your live Vercel URL
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `ADMIN_JWT_SECRET`: A secure random string
   - `ADMIN_EMAIL`: Your preferred admin login email
   - `ADMIN_DEFAULT_PASSWORD`: Your preferred admin login password

---

## 📝 Limitations & Architectural Notes

1. **Dual-Mode Persistence:** In development (`NODE_ENV=development`), the application uses a local JSON fallback store (`server/data/store.json`) when Supabase credentials are not provided. In production (`NODE_ENV=production`), Supabase credentials are **required** — the server will refuse to start without them.
2. **Production Authentication:** In production with Supabase active, the custom JWT login path (email/password from `.env`) is disabled. All authentication goes through Supabase Auth, and administrators must be explicitly provisioned via `bootstrap_admin()`.
3. **Payment Gateway Integration:** The current quotation workflow focuses on detailed lead intake, scope specification, and quotation generation. Direct online deposit payment processing (e.g., Razorpay/Stripe) can be layered into the quotation acceptance stage.
4. **Email Notifications:** The backend records inquiries and quotations directly to the database. An optional SMTP/Resend transactional email handler can be connected for real-time email dispatch.
