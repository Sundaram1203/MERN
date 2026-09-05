# User Module — Full-Stack Application

A production-ready full-stack application with **React** frontend and **Node.js/Express** backend. Features complete user authentication: registration, OTP email verification, login, profile management, profile image upload, and a user directory.

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| **Register** | First name, last name, email, password with server-side validation |
| **OTP Verification** | 6-digit OTP sent via email, 5-minute expiry |
| **Login** | Email + password with session storage |
| **Profile** | View user info + upload profile photo |
| **User Directory** | List all users, search, view details in modal |
| **Logout** | Clears session, notifies server |
| **Swagger Docs** | Auto-generated API docs at `/api-docs` |

---

## 🗂 Project Structure

```
project/
├── backend/                  # Node.js + Express API
│   ├── app.js                # Entry point
│   ├── .env                  # Environment variables
│   ├── schema.sql            # MySQL database schema
│   ├── config/
│   │   ├── db.js             # MySQL connection pool
│   │   └── swagger.js        # Swagger config
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── models/
│   │   └── auth.model.js     # All DB queries (fixed)
│   ├── routes/
│   │   └── auth.route.js     # All API routes + Swagger JSDoc
│   ├── middleware/
│   │   └── upload.js         # Multer image upload
│   ├── mail/
│   │   └── sendmail.js       # Nodemailer OTP email
│   └── uploads/profile/      # Uploaded profile images
│
└── frontend/                 # React 18 SPA
    ├── .env                  # REACT_APP_API_URL
    ├── public/index.html
    └── src/
        ├── App.js            # Routes + auth state
        ├── index.css         # Full design system (dark theme)
        ├── index.js          # React root
        ├── services/
        │   └── auth.service.js  # All API calls (Axios)
        └── components/
            ├── Home.js       # Landing / dashboard
            ├── Login.js      # Login form
            ├── Register.js   # Registration + OTP verify
            ├── Profile.js    # Profile + image upload
            └── UserList.js   # User directory + view modal
```

---

## ⚙️ Prerequisites

- **Node.js** >= 16
- **MySQL** >= 5.7 or MariaDB

---

## 🚀 Setup & Installation

### 1. Database

```sql
-- Connect to MySQL and run:
SOURCE backend/schema.sql;
```

Or manually:
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env .env.local    # Edit with your values
```

Edit `backend/.env`:
```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=db_swagger

JWT_SECRET=your_secret_key_here

EMAIL_FROM_USER=your@email.com
EMAIL_PASS=your_email_password
```

> **Note:** Email (SMTP) is optional. If not configured, registration still works — OTP will be logged to the console.

```bash
# Start backend
npm start

# Or with auto-reload (dev)
npm run dev
```

Backend runs at: `https://sundaram-mern-project.vercel.app`  
Swagger docs at: `https://sundaram-mern-project.vercel.app/api-docs`

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment (optional — defaults to localhost:3000)
# Edit frontend/.env if your backend is on a different URL

# Start React dev server
npm start
```

Frontend runs at: `https://sundaram-mern-project.vercel.app`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/otp_verify` | Verify OTP |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/login_list` | Get all users |
| POST | `/api/auth/login_view` | Get user by ID |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/upload` | Upload profile image |

Full interactive docs: `https://sundaram-mern-project.vercel.app/api-docs`

---

## 🛠 Fixes Applied

| Issue | Fix |
|-------|-----|
| Logout query used wrong table (`aiasa_users_master`) | Fixed to use `swag_user_master` |
| `mysql.createConnection` — no reconnect on drop | Replaced with `createPool` |
| Raw string interpolation in SQL queries | Changed to parameterized queries (`?` placeholders) |
| `sendmail.js` used `fileURLToPath` from `url` (CommonJS incompatible) | Removed unused import |
| Register page sent `username` but API required `first_name`/`last_name` | Completely rebuilt with correct fields |
| Auth service `login()` stored wrong data shape | Fixed to store `response.data.data` |
| `login_list` route was `GET` but Swagger docs said `POST` | Kept as `GET`, fixed docs |
| `ejs` package imported but not used in `sendmail.js` | Removed |
| No `.gitignore` for `node_modules` / uploads | Added |
| No `uploads/profile` directory creation on startup | Added to `upload.js` middleware |

---

## 🎨 Design System

The frontend uses a custom dark design system built with CSS variables:

- **Font**: Syne (headings) + DM Sans (body)
- **Theme**: Deep navy dark background with purple/pink accent gradient
- **Components**: Glass-morphism cards, animated backgrounds, smooth transitions
- **Responsive**: Mobile-first, works on all screen sizes

---

## 📝 Notes

- Passwords are stored as plain text AND MD5 hash (as per original schema). For production, replace with bcrypt.
- The `is_verified` column is set to `1` after OTP verification.
- Uploaded images are stored in `backend/uploads/profile/` and served at `/uploads/profile/<filename>`.
- If SMTP is not configured, registration succeeds but no email is sent (error is logged, not thrown).
