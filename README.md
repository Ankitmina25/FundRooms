# FundRooms — Mini ERP + CRM Operations Portal

A full-stack ERP/CRM system for wholesale/distribution companies. Manages customers, products, stock, and sales challans with role-based access control.

---

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Auth**: JWT-based authentication
- **Validation**: Custom validation helpers

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **PDF Export**: Print-ready Tax Invoice & Delivery Challan PDF generator (`@media print` styling + Invoice Modal)
- **Styling**: Vanilla CSS (dark admin theme)

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose (`backend`, `frontend` Nginx, `db` MySQL 8.0)
- **CI/CD**: GitHub Actions pipeline for automated testing and deployment to Railway (Backend) & Vercel (Frontend)

---

## Project Structure

```
FundRooms/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions CI/CD (Railway + Vercel)
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/db.ts           # Prisma client
│   │   ├── controllers/           # Route handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── customer.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   └── challan.controller.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  # JWT + Role auth
│   │   ├── routes/                # Express routes
│   │   ├── utils/validate.ts      # Validation helpers
│   │   ├── seed.ts                # Database seeder
│   │   └── server.ts              # Express app entry
│   ├── Dockerfile                 # Backend container definition
│   ├── .dockerignore
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/index.ts           # Axios + API functions
│   │   ├── components/            # Layout, Sidebar, InvoiceModal
│   │   ├── context/AuthContext.tsx # Auth state management
│   │   ├── pages/                 # All pages (Customers, Products, Challans)
│   │   ├── App.tsx                # Router setup
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── Dockerfile                 # Multi-stage Vite + Nginx container definition
│   ├── nginx.conf                 # Nginx SPA fallback config
│   ├── .dockerignore
│   ├── .env
│   └── package.json
├── docker-compose.yml             # Full-stack Docker orchestration
└── README.md
```

---

## Setup Instructions

### Option 1: Docker (Recommended)
Run the entire stack (MySQL 8, Backend API, Frontend Nginx) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:5001`
- **MySQL Database**: `localhost:3306`

---

### Option 2: Local Manual Setup

#### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `/backend`:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/FundRooms"
PORT=5001
JWT_SECRET=your_super_secret_key
```

Create the database & run migrations:
```bash
mysql -u root -p -e "CREATE DATABASE FundRooms;"
npx prisma migrate dev
npx prisma generate
npm run seed
npm run dev
```

Backend runs at `http://localhost:5001`

#### 2. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## PDF Invoice Export Feature

Users can preview and download printable Tax Invoices & Delivery Challans:
1. Navigate to **Sales Challans** and click on any Challan.
2. Click the **📄 Export Invoice / PDF** button at the top.
3. A formatted modal will pop up with company details, customer address, product table breakdown, tax calculation (18% GST), and total amount.
4. Click **Print / Save as PDF** to generate or print the official invoice directly from the browser.

---

## GitHub Actions Deployment Pipeline (Railway + Vercel)

The repository includes `.github/workflows/deploy.yml` which automatically builds, verifies, and deploys code on push to `main`:

### Required Repository Secrets:
Set the following secrets in GitHub Repository (`Settings -> Secrets and variables -> Actions`):

- **Railway Backend Deployment**:
  - `RAILWAY_TOKEN`: Your Railway API token (generated from Railway Account Settings).

- **Vercel Frontend Deployment**:
  - `VERCEL_TOKEN`: Your Vercel Personal Access Token.
  - `VERCEL_ORG_ID`: Your Vercel Organization / Team ID.
  - `VERCEL_PROJECT_ID`: Your Vercel Project ID.

---

## Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundrooms.com | admin123 |
| Sales | sales@fundrooms.com | sales123 |
| Warehouse | warehouse@fundrooms.com | warehouse123 |
| Accounts | accounts@fundrooms.com | accounts123 |

---

## Role-Based Access Control

| Feature | Admin | Sales | Warehouse | Accounts |
|---------|-------|-------|-----------|----------|
| View Everything | ✅ | ✅ | ✅ | ✅ |
| Manage Customers | ✅ | ✅ | ❌ | ✅ |
| Manage Products | ✅ | ❌ | ✅ | ❌ |
| Manage Stock | ✅ | ❌ | ✅ | ❌ |
| Manage Challans | ✅ | ✅ | ❌ | ✅ |
| Export Invoice PDF | ✅ | ✅ | ✅ | ✅ |

---

## Build for Production Manually

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```
