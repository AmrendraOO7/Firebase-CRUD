import Layout from '../../components/Layout'
import { useAuth } from '../../context/AuthContext'
import './Home.css'

function Home() {
  const { currentUser } = useAuth()

  return (
    <Layout>
      <div className="home-page">
        <div className="home-card">
          <h1 className="auth-title">You&apos;re logged in!</h1>
          <p className="home-email">
            Signed in as <strong>{currentUser?.email}</strong>
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default Home
