import { useEffect } from 'react'
import { logout } from '../utils/auth'
import { Link } from 'react-router-dom'
import logo from './logo_arielle.png'

function Logout() {
  useEffect(() => { logout() }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#fdf6f4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        <div style={{ marginBottom: 32 }}>
          <img src={logo} alt="Lip's Empire by Arielle" style={{ height: 90, objectFit: 'contain' }} />
        </div>

        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>👋</div>
          <h2 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 22, color: '#1a1a1a' }}>
            Vous etes deconnectee
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#aaa' }}>
            Merci de votre visite sur Lip's Empire by Arielle
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link to="/login" style={{
              display: 'block', padding: '13px',
              background: '#1a1a1a', color: '#fedbd1',
              borderRadius: 10, fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
            }}>
              Se connecter
            </Link>
            <Link to="/" style={{
              display: 'block', padding: '13px',
              background: 'transparent', color: '#555',
              borderRadius: 10, fontSize: 14, fontWeight: 500,
              textDecoration: 'none', border: '1px solid #e5e7eb',
            }}>
              Retour a l'accueil
            </Link>
          </div>
        </div>

        <p style={{ marginTop: 20, fontSize: 14, color: '#aaa' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#c44569', fontWeight: 600, textDecoration: 'none' }}>
            Creer un compte
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Logout
