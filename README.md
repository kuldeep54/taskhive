# TaskHive — Team Task Manager

> A full-stack team productivity app built with the MERN stack. Manage projects, assign tasks, and track team performance with role-based access control.

### 🔗 Live Demo

| | Link |
|---|---|
| 🌐 **Frontend** | [https://taskhive-five.vercel.app](https://taskhive-five.vercel.app) |
| 🔌 **Backend API** | [https://taskhive-backend.onrender.com](https://taskhive-backend.onrender.com) |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (NoSQL), Mongoose |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **State** | React Context API |
| **HTTP** | Axios with interceptors |

---

## ✨ Features

- 🔐 **Authentication** — Register/Login with JWT, role-based (Admin / Member)
- 📁 **Projects** — Create, manage, add/remove members
- ✅ **Tasks** — Full CRUD, priority levels, due dates, status tracking
- 📊 **Dashboard** — Live stats, recent tasks, tasks-per-user (admin only)
- 👥 **Users** — Admin panel: manage roles, remove members
- 🔔 **Notifications** — Overdue, due-soon, newly-assigned alerts
- 👤 **Profile** — Edit name, change password, account info
- 🛡️ **RBAC** — All routes protected at API and UI level

---

## 🏁 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/kuldeep54/taskhive.git
cd taskhive
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_API_URL
npm run dev
```

### 4. Open
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskhive
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📡 API Endpoints

### Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT |

### Projects
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Private | Get all (Admin) / own (Member) |
| POST | `/api/projects` | Admin | Create project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Private | Get all (Admin) / own (Member) |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Private | Update task/status |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Users
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Get all users with task counts |
| PUT | `/api/users/:id/role` | Admin | Change user role |
| DELETE | `/api/users/:id` | Admin | Remove member (not admins) |
| PUT | `/api/users/profile/name` | Private | Update own name |
| PUT | `/api/users/profile/password` | Private | Change own password |

### Other
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Private | Dashboard stats |
| GET | `/api/notifications` | Private | User notifications |

---

## 🌐 Deployment

### ✅ Live Deployment

| Service | Platform | URL |
|---|---|---|
| **Frontend** | Vercel | [https://taskhive-five.vercel.app](https://taskhive-five.vercel.app) |
| **Backend API** | Render | [https://taskhive-backend.onrender.com](https://taskhive-backend.onrender.com) |

### Backend → Render (Free)
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Connect the `kuldeep54/taskhive` GitHub repo
4. Set **Root Directory** to `backend`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Add these **Environment Variables**:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a strong secret key
   - `FRONTEND_URL` — `https://taskhive-five.vercel.app`
   - `PORT` — `10000`
8. Live at: `https://taskhive-backend.onrender.com`

### Frontend → Vercel (Free)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project** → Import `kuldeep54/taskhive`
3. Set **Root Directory** to `frontend`
4. Add **Environment Variable**:
   - `VITE_API_URL` — `https://taskhive-backend.onrender.com/api`
5. Live at: `https://taskhive-five.vercel.app`

---

## 👤 Default Test Accounts

Register your own via `/register` — select **Admin** or **Member** role.

---

## 📄 License

MIT
