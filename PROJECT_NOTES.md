# BCA Project — Study Notes

**Project:** `bca_project`
**Topic:** Login & Signup with Firebase Authentication
**Frontend:** React + Vite
**Backend:** Firebase (Authentication)
**Styling:** Vanilla CSS (plain hand-written CSS, no UI framework)

> These notes explain everything about the project **up to this point** — from empty setup to the working Login/Signup pages. Read them alongside the code.

---

## 1. What this project does

This project is a **single-page web app** built with React that lets a user:

1. **Sign up** — create a new account using email + password.
2. **Log in** — sign in with the created email + password.
3. **See a protected home page** — a page you can only see when logged in.
4. **Log out** — return to the login page.

All account data (email, password) is stored securely by **Firebase**, Google's cloud backend. We never write a database ourselves for this feature.

---

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| **React** | Frontend UI library (components, state, hooks) |
| **Vite** | Build tool + dev server (fast, modern alternative to Webpack) |
| **Firebase** (`firebase/auth`) | Authentication service — sign up, sign in, sign out |
| **React Router** (`react-router-dom`) | Page routing (`/`, `/login`, `/signup`) |
| **React Hot Toast** (`react-hot-toast`) | Nice pop-up notification messages |
| **CSS** | Styling — plain vanilla CSS files |

All dependencies are listed in `package.json`.

---

## 3. Prerequisites (what you need installed)

- **Node.js** (LTS version) — includes `npm`
- A **Firebase account** (free Google account works)
- A code editor (VS Code recommended)
- A browser (Chrome recommended)

Check your Node version:

```bash
node -v
npm -v
```

---

## 4. Project Structure

```
bca_project/
├── index.html              # Main HTML file (loads the React app)
├── package.json            # Dependencies + scripts
├── vite.config.js          # Vite configuration
├── eslint.config.js        # Code-quality (lint) rules
├── public/                 # Static files (icons)
└── src/
    ├── main.jsx            # React entry point (renders <App/>)
    ├── App.jsx             # Routing setup (all pages live here)
    ├── index.css           # Global styles (colors, fonts)
    ├── firebase/
    │   └── firebase.js     # Firebase initialization + config
    ├── context/
    │   └── AuthContext.jsx # Auth state shared across the app
    ├── pages/
    │   ├── Login.jsx       # Login page
    │   ├── Signup.jsx      # Signup page
    │   ├── Home.jsx        # Protected home page
    │   └── auth.css        # Vanilla CSS for the pages
    └── utils/
        └── authErrors.js   # Converts Firebase errors to friendly messages
```

---

## 5. Firebase Setup (one-time, in the browser)

> This must be done **before** login/signup will work.

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**, name it (e.g. `bca-4th`), click **Create**.
3. Click **Authentication** in the left menu → **Get started**.
4. Go to the **Sign-in method** tab.
5. Click **Email/Password** → **Enable** it → **Save**.
   - If you skip this, you will get the error `auth/operation-not-allowed`.
6. Go to **Project settings** (gear icon) → **Your apps** → **Web app** (icon `</>`).
7. Register the app (any name), then copy the **Firebase config** object shown.

That config object is what you paste into the code (see next section).

---

## 6. Firebase Config in Code

File: `src/firebase/firebase.js`

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    // ADD YOUR FIREBASE CONFIGURATION HERE
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
```

### What each part does

- **`initializeApp(firebaseConfig)`** — connects your app to your Firebase project. The config values identify *which* Firebase project to talk to.
- **`getAuth(app)`** — creates an *Auth instance* you use for login/signup/signout.
- **`export const auth`** — other files import this `auth` object to call Firebase Auth functions.

> **Important note for students:** The API key being visible in the code is **normal** for Firebase web apps — the key is not a secret like a password. Security is enforced by Firebase Security Rules. (In a real job, people often move config into environment variables, but for a college project this is fine.)

---

## 7. AuthContext — Sharing Login State Across the App

File: `src/context/AuthContext.jsx`

**Why do we need this?** Many parts of the app need to know *"is the user logged in?"* (the router, Home page, etc.). Passing that from component to component is messy. Instead we use **React Context** — one central "state box" that any component can read.

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    return signOut(auth)
  }

  const value = { currentUser, loading, login, signup, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Key concepts to learn

| Concept | Explanation |
|---|---|
| `useState` | Stores data that can change. Here: `currentUser` (null or user object) and `loading` (true while we check the login state). |
| `useEffect` | Runs code after the component renders. Here it subscribes to Firebase auth changes. |
| `onAuthStateChanged` | Firebase function that **fires every time the login state changes** (login, logout, page refresh). This is why a page refresh keeps you logged in! |
| `unsubscribe` | `onAuthStateChanged` returns a cleanup function. We return it from `useEffect` so it stops listening when the component unmounts. |
| `useContext` / `createContext` | React's way of sharing values without "prop drilling". |

### The functions exposed (via `useAuth()`)

- `currentUser` → the logged-in user object, or `null` if logged out.
- `loading` → `true` while Firebase figures out the login state.
- `login(email, password)` → calls Firebase `signInWithEmailAndPassword`.
- `signup(email, password)` → calls Firebase `createUserWithEmailAndPassword`.
- `logout()` → calls Firebase `signOut`.

---

## 8. Routing — `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function GuestRoute({ children }) {
  const { currentUser, loading } = useAuth()
  if (loading) return null
  if (currentUser) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          } />
          <Route path="/login" element={
            <GuestRoute><Login /></GuestRoute>
          } />
          <Route path="/signup" element={
            <GuestRoute><Signup /></GuestRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
```

### How routing + protection works

| Route | Who can see it |
|---|---|
| `/` | **Only logged-in users** → `ProtectedRoute` redirects others to `/login` |
| `/login` | **Only guests** (not logged in) → `GuestRoute` sends logged-in users to `/` |
| `/signup` | **Only guests** |
| `*` (anything else) | Redirected to `/` |

### Why the wrapper components exist

- **`ProtectedRoute`** — wraps a page that requires login. If no user, it navigates to the login page with `<Navigate to="/login" replace />`.
- **`GuestRoute`** — the opposite. If a user is already logged in, they shouldn't see login/signup, so they get sent to the home page.
- `if (loading) return null` — while Firebase is still checking auth, we render nothing to avoid a "flash" of the wrong page.

**Structure of the app:**

```
<BrowserRouter>        ← knows how to handle URLs
  <AuthProvider>       ← provides currentUser/loading to every page
    <Toaster/>         ← renders toast notifications
    <Routes>           ← matches the URL to a page
```

---

## 9. Login Page — `src/pages/Login.jsx`

```jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { getAuthErrorMessage } from '../utils/authErrors'
import './auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      toast.success('Logged in successfully!')
      navigate('/')
    } catch (error) {
      toast.error(getAuthErrorMessage(error.code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to continue to your account</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input id="password" type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required />
              <button type="button" className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
```

### Step-by-step explanation

1. **Form state** — `useState` tracks `email`, `password`, `showPassword`, `submitting`. Every keystroke updates the state, and the input's `value` is bound back to state. This is a **controlled input**.
2. **`handleSubmit`** runs when the form is submitted:
   - `e.preventDefault()` — stops the page from reloading (default browser behavior).
   - Empty-field check → shows a toast error.
   - `setSubmitting(true)` — disables the button and shows "Logging in...".
   - `await login(email, password)` — calls Firebase. `await` pauses here until Firebase replies.
   - On success → success toast + `navigate('/')` to go to the home page.
   - On failure → `getAuthErrorMessage(error.code)` converts the Firebase error code into a friendly sentence.
   - `finally { setSubmitting(false) }` — re-enables the button either way.
3. **Show/Hide password** — toggles the input `type` between `text` and `password`.
4. **`<Link to="/signup">`** — React Router link (navigates without reloading the page).

---

## 10. Signup Page — `src/pages/Signup.jsx`

Almost identical to Login, plus:

- Extra fields: **Full name**, **Confirm password**.
- Extra validation:
  - Password must be **at least 6 characters** (Firebase's minimum).
  - **Password === Confirm password** check.
- Calls `signup(email, password)` from `useAuth()`, which internally calls Firebase `createUserWithEmailAndPassword`.

```jsx
if (password.length < 6) {
  toast.error('Password should be at least 6 characters.')
  return
}
if (password !== confirmPassword) {
  toast.error('Passwords do not match.')
  return
}
```

---

## 11. Home Page (Protected) — `src/pages/Home.jsx`

```jsx
function Home() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch {
      toast.error('Failed to log out. Please try again.')
    }
  }

  return (
    <div className="home-page">
      <div className="home-card">
        <h1 className="auth-title">You&apos;re logged in!</h1>
        <p className="home-email">
          Signed in as <strong>{currentUser?.email}</strong>
        </p>
        <button type="button" className="auth-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  )
}
```

### Points to note

- `currentUser?.email` — the `?.` is the **optional chaining** operator. If `currentUser` is null it returns `undefined` instead of crashing.
- The Logout button calls `logout()` (Firebase `signOut`), shows a toast, and navigates to `/login`.
- This page is only reachable because `ProtectedRoute` wraps it. Try visiting `/` while logged out — you get redirected to `/login`.

---

## 12. Friendly Error Messages — `src/utils/authErrors.js`

Firebase returns **error codes** like `auth/wrong-password`. Users shouldn't see raw codes, so we map them to friendly text:

```js
export function getAuthErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists.'
    case 'auth/invalid-email':        return 'Please enter a valid email address.'
    case 'auth/user-not-found':       return 'No account found with this email.'
    case 'auth/wrong-password':       return 'Incorrect password. Please try again.'
    case 'auth/invalid-credential':   return 'Incorrect email or password.'
    case 'auth/weak-password':        return 'Password should be at least 6 characters.'
    case 'auth/too-many-requests':    return 'Too many attempts. Please try again later.'
    case 'auth/operation-not-allowed': return 'Email/Password sign-in is not enabled in the Firebase console.'
    case 'auth/network-request-failed': return 'Network error. Please check your connection.'
    default: return 'Something went wrong. Please try again.'
  }
}
```

> **Study tip:** Understand `switch` statements. They're a clean way to pick a result based on one value.

---

## 13. Styling — Vanilla CSS

File: `src/pages/auth.css`

We wrote plain CSS (no Tailwind/Bootstrap). The pages reuse **CSS variables** from `src/index.css`:

```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --accent: #aa3bff;          /* purple brand color */
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --shadow: rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;
}
```

### Interesting techniques used

| Technique | Where |
|---|---|
| `display: flex; align-items: center; justify-content: center` | `.auth-page` centers the card both vertically and horizontally |
| `gap` | Space between form fields without margins |
| `:focus` styling with `box-shadow` | Highlights the input you're typing in |
| `::placeholder` | Styles the grey hint text inside inputs |
| `@media (max-width: 480px)` | Responsive: smaller padding/fonts on phones |
| `:disabled` | Makes the submit button look grey while submitting |
| `position: absolute` | Positions the Show/Hide button inside the password field |

The dark-mode friendly styles come from `index.css` (`prefers-color-scheme: dark`), which swaps the CSS variables automatically.

---

## 14. Entry Point — `src/main.jsx` and `index.html`

**`index.html`** has a `<div id="root">` and a script tag loading `/src/main.jsx`.

**`src/main.jsx`:**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- `createRoot(...).render(<App />)` — takes the `<App/>` component tree and mounts it into the `#root` div.
- `StrictMode` — a React helper that double-runs effects in development to help catch bugs. (It does NOT run twice in production.)

---

## 15. How to Run the Project

```bash
npm install        # only needed the first time
npm run dev        # start the dev server (Vite)
```

Then open the URL printed in the terminal (usually **http://localhost:5173**).

### Other useful commands

```bash
npm run build      # create an optimized production build in /dist
npm run preview    # preview the production build
npm run lint       # run ESLint code-quality checks
```

---

## 16. Common Errors & Fixes

| Error you see | Meaning | Fix |
|---|---|---|
| `auth/operation-not-allowed` | Email/Password sign-in is disabled | Enable it in Firebase console → Authentication → Sign-in method |
| `auth/email-already-in-use` | Signing up with an existing email | Use a different email, or log in instead |
| `auth/invalid-credential` | Wrong email or password | Double-check the credentials |
| `auth/weak-password` | Password under 6 characters | Use a longer password |
| `auth/too-many-requests` | Too many failed attempts | Wait a bit and try again |
| Blank page on `/login` | Route not matching, or Firebase config missing | Check the route path and that `firebase.js` has your real config |
| `getAuth is not defined` | Missing import | Make sure `getAuth` is imported from `firebase/auth` |

---

## 17. Project Summary (concept map)

```
User fills Signup form
        │
        ▼
createUserWithEmailAndPassword (Firebase)
        │
        ▼
Firebase stores account & returns a user session
        │
        ▼
onAuthStateChanged notices → currentUser is set
        │
        ▼
ProtectedRoute allows access to Home page
        │
        ▼
User clicks Logout → signOut() → currentUser becomes null
        │
        ▼
Redirected back to /login
```

**The three important Firebase functions:**

| Function | Action |
|---|---|
| `createUserWithEmailAndPassword(auth, email, password)` | Create account |
| `signInWithEmailAndPassword(auth, email, password)` | Log in |
| `signOut(auth)` | Log out |
| `onAuthStateChanged(auth, callback)` | Listener for login state changes |

---

## 18. Ideas for Next Steps (what you could add next)

- Store extra profile data (name, phone) in **Firebase Firestore**.
- Add **Google login** via the same Firebase console (Google provider).
- Add a **Forgot password** link using Firebase `sendPasswordResetEmail`.
- Add **email verification** (`sendEmailVerification`).
- Add a **navbar** that shows "Log in / Sign up" vs. the user's email + Logout.
- Remember me / session persistence customization.

---

*End of notes — good luck with your project!*
