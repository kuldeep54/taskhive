# TaskHive — Team Task Manager

> A full-stack team productivity app built with the MERN stack. Manage projects, assign tasks, and track team performance with role-based access control.

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
git clone https://github.com/yourusername/taskhive.git
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

### Backend → Railway
1. Push backend to GitHub
2. New project on [railway.app](https://railway.app)
3. Connect GitHub repo, set root to `/backend`
4. Add environment variables in Railway dashboard
5. Deploy

### Frontend → Vercel
1. Push frontend to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set root to `/frontend`
4. Add `VITE_API_URL` environment variable
5. Deploy

---

## 👤 Default Test Accounts

Register your own via `/register` — select **Admin** or **Member** role.

---

## 📄 License

MIT
