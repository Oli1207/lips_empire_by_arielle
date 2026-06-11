import { useState, useEffect } from 'react'
import { login } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import Swal from 'sweetalert2'
import apiInstance from '../utils/axios'
import CartID from '../plugin/CartID'
import logo from './logo_arielle.png'

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  useEffect(() => { if (isLoggedIn()) navigate('/') })

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await login(email, password)
    if (error) {
      Swal.fire({ icon: 'error', title: 'Identifiants incorrects', text: 'Verifiez votre email et mot de passe.', confirmButtonColor: '#1a1a1a' })
      setIsLoading(false)
    } else {
      const cart_id = CartID()
      if (cart_id) apiInstance.post('cart/merge/', { cart_id }).catch(() => {})
      navigate('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fdf6f4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={logo} alt="Lip's Empire by Arielle" style={{ height: 90, objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.07)',
        }}>
          <h2 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 22, color: '#1a1a1a' }}>
            Connexion
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#aaa' }}>
            Acces a votre espace client
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="marie@email.com"
                required
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid #e5e7eb', borderRadius: 10,
                  fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  background: '#fafafa',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '12px 42px 12px 14px',
                    border: '1px solid #e5e7eb', borderRadius: 10,
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    background: '#fafafa',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 0,
                  }}
                >
                  <EyeIcon open={showPwd} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: '#1a1a1a', color: '#fedbd1',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Lien inscription */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#aaa' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#c44569', fontWeight: 600, textDecoration: 'none' }}>
            Creer un compte
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login
