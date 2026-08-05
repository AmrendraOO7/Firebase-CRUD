import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import './auth.css'

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

export default Home
