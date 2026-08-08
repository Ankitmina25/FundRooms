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
- **Styling**: Vanilla CSS (dark admin theme)

---

## Project Structure

```
FundRooms/
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
│   │   │   ├── auth.routes.ts
│   │   │   ├── customer.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   └── challan.routes.ts
│   │   ├── utils/validate.ts      # Validation helpers
│   │   ├── seed.ts                # Database seeder
│   │   └── server.ts              # Express app entry
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/index.ts           # Axios + API functions
│   │   ├── components/            # Layout, Sidebar
│   │   ├── context/AuthContext.tsx # Auth state management
│   │   ├── pages/                 # All pages
│   │   ├── App.tsx                # Router setup
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── .env
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd FundRooms
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/FundRooms"
PORT=5000
JWT_SECRET=your_super_secret_key
```

Create the database:
```bash
mysql -u root -p -e "CREATE DATABASE FundRooms;"
```

Run migrations:
```bash
npx prisma migrate dev
```

Generate Prisma client:
```bash
npx prisma generate
```

Seed the database with test users:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in `/frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | mysql://root:pass@localhost:3306/FundRooms |
| PORT | Server port | 5000 |
| JWT_SECRET | Secret key for JWT tokens | your_super_secret_key |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API base URL | http://localhost:5000/api |

---

## Test Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundrooms.com | admin123 |
| Sales | sales@fundrooms.com | sales123 |
| Warehouse | warehouse@fundrooms.com | warehouse123 |
| Accounts | accounts@fundrooms.com | accounts123 |

---

## API Documentation

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/me` | Get current user profile | Yes |

### Customers
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/customers` | List customers (search, filter, pagination) | All |
| GET | `/api/customers/:id` | Get customer detail | All |
| POST | `/api/customers` | Create customer | Admin, Sales, Accounts |
| PUT | `/api/customers/:id` | Update customer | Admin, Sales, Accounts |
| POST | `/api/customers/:id/follow-up` | Add follow-up note | Admin, Sales, Accounts |

### Products
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/products` | List products (search, pagination) | All |
| GET | `/api/products/low-stock` | Get low stock products | All |
| GET | `/api/products/:id` | Get product with stock movements | All |
| POST | `/api/products` | Create product | Admin, Warehouse |
| PUT | `/api/products/:id` | Update product | Admin, Warehouse |
| POST | `/api/products/:id/stock` | Add stock movement (IN/OUT) | Admin, Warehouse |

### Sales Challans
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/challans` | List challans (search, filter, pagination) | All |
| GET | `/api/challans/:id` | Get challan with items | All |
| POST | `/api/challans` | Create challan (Draft/Confirmed) | Admin, Sales, Accounts |
| PUT | `/api/challans/:id/status` | Confirm or cancel challan | Admin, Sales, Accounts |

### Query Parameters
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10, max: 100)
- `search` — Search term
- `status` — Filter by status
- `customerType` — Filter by customer type
- `category` — Filter by product category

---

## Architecture

### Backend
- **MVC Pattern**: Controllers handle business logic, Routes define endpoints, Middlewares handle auth
- **Prisma ORM**: Type-safe database queries with MySQL
- **JWT Auth**: Stateless authentication with role-based access control
- **Transactions**: Stock updates and challan confirmations use database transactions to ensure data consistency
- **Product Snapshots**: Challan items store product name, SKU, and price at the time of creation (not just product ID)

### Frontend
- **React SPA**: Single-page application with client-side routing
- **Context API**: AuthContext for global authentication state
- **Centralized API Layer**: All API calls go through a single Axios instance with JWT interceptor
- **Role-Based UI**: Buttons and actions are shown/hidden based on user role

### Key Business Logic
1. **Stock Management**: Stock movements (IN/OUT) update `currentStock` atomically using transactions
2. **Challan Confirmation**: When a challan is confirmed, stock is reduced for all items. If any product has insufficient stock, the entire operation is rolled back
3. **Low Stock Alerts**: Products with `currentStock < minimumStock` are flagged
4. **Follow-up Notes**: Notes are appended with timestamps, preserving history

---

## Role-Based Access Control

| Feature | Admin | Sales | Warehouse | Accounts |
|---------|-------|-------|-----------|----------|
| View Everything | ✅ | ✅ | ✅ | ✅ |
| Manage Customers | ✅ | ✅ | ❌ | ✅ |
| Manage Products | ✅ | ❌ | ✅ | ❌ |
| Manage Stock | ✅ | ❌ | ✅ | ❌ |
| Manage Challans | ✅ | ✅ | ❌ | ✅ |

---

## Deployment

### Option 1: Free Hosting
- **Frontend**: Deploy to Vercel/Netlify (static build)
- **Backend**: Deploy to Render/Railway
- **Database**: Use Neon/Supabase/Render Postgres (switch provider in Prisma)

### Option 2: Local Demo
- Follow the setup instructions above
- All features work locally without any external dependencies

### Build for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## Assumptions & Known Limitations

1. **Single Warehouse**: The current design stores warehouse as a string field. A multi-warehouse system would need a separate Warehouse model.
2. **Follow-up Notes**: Notes are stored as a single text field with timestamps appended. A dedicated FollowUpNote model would be better for a production system.
3. **No Invoice Module**: The system creates challans but does not generate formal invoices or PDFs.
4. **No File Upload**: Product images are not supported in this version.
5. **Mobile Sidebar**: On mobile devices, the sidebar is hidden. A hamburger menu toggle would improve the mobile experience.
6. **Search**: Search uses MySQL `contains` which does `LIKE %term%`. Full-text search would be more performant for large datasets.
