# Team Access Manager Tool

A secure, full-stack application for managing user and team access in organizations.

## 🔗 Repositories

- [Backend (Spring Boot + PostgreSQL)](https://github.com/yashwant340/team-access-manager-service)
- [Frontend (React + MUI)](https://github.com/yashwant340/team-access-manager-UI)

## ✨ Features

- **Authentication & Security**
  - JWT-based login/logout
  - Role-based access (Platform Admin, Team Admin and User)
- **User Onboarding**
  - Request Access workflow
  - Admin approval process
  - Email-based activation with OTP
- **Password Reset**
  - OTP-based verification + reset
- **Dashboards**
  - User Dashboard
  - Team Admin Dashboard (manage users, permissions and requests limited to the team scope)
  - Platform Admin Dashboard (manage teams, users, permissions and login requests)
- **Audit & Logs**
  - Track user and admins activity.
- **Notifications**
  - Email alerts for onboarding, and password resets

---

# Team Access Manager – Frontend

This is the **React** frontend for the project.

## ⚙️ Tech Stack
- #### Framework: React (with TypeScript)

- #### Key Libraries:
    -Material UI (MUI) – prebuilt UI component library for consistent design
    -Axios – library for making API calls
    -React Router – library for client-side routing/navigation

## ✨ Features
- JWT-based Login
- “Request Access” Form
- OTP-based Forgot Password Flow
- User Dashboard
- Admin Dashboard for team admin and platform admin (manage users & permissions)
- Audit Trail Display

---

## 🛠️ Setup Instructions

### 1. Clone
```bash
git clone https://github.com/yashwant340/team-access-manager-UI
cd team-access-manager-UI
```
### 2. Install
npm install

### 3. Configure Backend URL

Edit src/api/axiosInstance.ts:

const api = axios.create({
  baseURL: "http://localhost:8080/api", // change if backend is deployed
  withCredentials: true,
});

### 4. Run Frontend
npm start


App runs on: http://localhost:3000


## 👤 Author

Yaswanth Kumar
Full Stack Developer (React | Spring Boot | PostgreSQL)
