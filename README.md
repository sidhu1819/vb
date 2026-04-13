# VB Software Solutions - Full-Stack SaaS Platform

A massive, premium web application operating as a combined Web Agency Landing Page and a fully-fledged SaaS CRM/Client Portal. Built on the MERN stack with highly interactive 3D Three.js hero visuals and Drag-and-Drop admin capabilities.

## Tech Stack
**Frontend:** React (Vite), TailwindCSS, Framer Motion, `@react-three/fiber` / `@react-three/drei` (3D Assets), `react-hook-form` & `zod` (Validation), `@dnd-kit/core` (Kanban UI).
**Backend:** Node.js, Express, MongoDB (Mongoose), `jsonwebtoken`, `bcryptjs`, `passport-google-oauth20`, `nodemailer` + `speakeasy` (Email OTPs).

---

## 🚀 1. Full Local Setup Guide

Follow these steps to spin up the entire application concurrently on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (or local MongoDB instance)
- A Google Account (for OAuth and App Passwords)

### Step-by-Step Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd vb-software-solutions
   ```

2. **Install Root Dependencies:**
   This installs `concurrently` to run both client and server from a single command.
   ```bash
   npm install
   ```

3. **Install Client & Server Dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```

4. **Environment Variables Configuration:**
   Create a `.env` file in the root directory (or respective folders). Refer to the **Environment Variables Explained** section below.

5. **Seed the Database (Optional but Recommended):**
   ```bash
   cd server
   npm run seed
   ```
   *This automatically creates dummy client and admin accounts, projects, and pipeline items.*

6. **Start the Application:**
   Go to the root directory and run:
   ```bash
   npm run dev
   ```
   *This opens the Frontend at `http://localhost:3000` and Backend at `http://localhost:5000`.*

---

## 🔑 2. Environment Variables Explained

### Server `.env` (`/server/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vb-business
JWT_SECRET=super_secret_string_for_access_token
JWT_REFRESH_SECRET=super_secret_string_for_refresh_token
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_digit_app_password
CLIENT_URL=http://localhost:3000
BCRYPT_ROUNDS=12
```

### Client `.env` (`/client/.env`)
```ini
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## 🌐 3. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free tier cluster.
2. In the "**Database Access**" tab, create a new Database User with a secure password.
3. In the "**Network Access**" tab, click **Add IP Address** and choose `Allow Access from Anywhere` (or restrict to your IP).
4. Go back to Databases, click **Connect -> Drivers -> Node.js**.
5. Copy the connection string provided and replace `<password>` with your Database User password. Paste this into your `MONGODB_URI` environment variable.

---

## 📧 4. Gmail App Password Setup (For Nodemailer)

To send secure Email OTPs and Welcoming emails, you need an App Password if using Gmail.
1. Log in to your Google Account.
2. Go to [Manage your Google Account -> Security](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is enabled.
4. Search for **App passwords** in the top search bar. You may need to verify your password again.
5. In the "Select app" dropdown, choose **Other (Custom name)** and type "VB Solutions Node App".
6. Click **Generate**.
7. Google will show you a 16-character password in a yellow box. Copy this (remove spaces) and paste it into `EMAIL_PASS` in your `.env`.

---

## 🛡️ 5. Google OAuth Setup Steps

To enable the "Sign in with Google" functionality:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the top dropdown to **Create a New Project** (e.g., "VB Auth").
3. Once created, search for "OAuth consent screen".
   - Select **External** and hit Create.
   - Fill out the App Name, Support email, and developer contact info. Skip the rest.
4. Navigate to **Credentials** on the left menu.
5. Click **+ CREATE CREDENTIALS** -> **OAuth client ID**.
6. Set the Application type to **Web application**.
7. Add the following to **Authorized JavaScript origins**:
   - `http://localhost:3000` (Local)
   - `https://your-production-frontend-url.vercel.app` (Live)
8. Add the following to **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback` (Local)
   - `https://your-production-backend-url.onrender.com/api/auth/google/callback` (Live)
9. Click **Create**. Copy your `Client ID` and `Client Secret` into your `.env` files.

---

## ☁️ 6. Deployment Guide (Vercel + Render)

### Deploying the Backend (Render)
1. Push your repository to GitHub.
2. Log into [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. **Root Directory**: `server`
5. **Build Command**: `npm install`
6. **Start Command**: `node server.js`
7. Expand `Advanced` and input **ALL** of your Server Environment Variables (refer to section 2).
8. **CRITICAL**: Update your `CLIENT_URL` env variable in Render to point to your future Vercel URL (e.g., `https://my-vb-app.vercel.app`).
9. Click **Create Web Service**. After it deploys, copy the newly generated backend URL.

### Deploying the Frontend (Vercel)
1. Log into [Vercel](https://vercel.com/) and click **Add New -> Project**.
2. Import your GitHub repository.
3. **Framework Preset**: Should automatically detect `Vite`.
4. **Root Directory**: Click Edit and select `client`.
5. **Environment Variables**: Add:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com` (from the step above).
   - `VITE_GOOGLE_CLIENT_ID` = `your_google_id`.
6. Click **Deploy**.

**Final OAuth Sync:** Now that you have live URLs, go back to your Google Cloud Console (Step 5.7 & 5.8) and ensure your new Vercel origin and Render redirect URIs are added!

---

Enjoy your fully-featured SaaS platform! 🚀
