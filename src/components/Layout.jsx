import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import './layout.css'

function Layout({ children }) {
    const { logout } = useAuth()
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
        <div className="app-layout">
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    Firebase CRUD
                </Link>
                <ul className="navbar-menu">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/about">About</Link>
                    </li>
                    <li>
                        <Link to="/services">Services</Link>
                    </li>
                    <li>
                        <Link to="/contact">Contact</Link>
                    </li>
                    <li>
                        <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                        <button type="button" className="logout-link" onClick={handleLogout}>
                            Log out
                        </button>
                    </li>
                </ul>
            </nav>

            <main className="app-content">{children}</main>
        </div>
    )
}

export default Layout
