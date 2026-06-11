import { useState, useEffect } from 'react'
import { login } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import Swal from 'sweetalert2'
import apiInstance from '../utils/axios'
import CartID from '../plugin/CartID'
import logo from './logo_arielle.png'
import { Eye, EyeOff } from 'lucide-react'

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

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1px solid #e8cfc8', borderRadius: 10,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: '#fff8f6',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #fce4dc 0%, #fedbd1 50%, #f2d8db 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src={logo} alt="Lip's Empire by Arielle" style={{ height: 90, objectFit: 'contain' }} />
        </div>

        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 8px 40px rgba(196,69,105,0.10)',
        }}>
          <h2 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 22, color: '#1a1a1a' }}>
            Connexion
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#b07a82' }}>
            Acces a votre espace client
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="marie@email.com"
                required style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...inputStyle, paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c44569', padding: 0 }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: '#1a1a1a', color: '#fedbd1',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7a4a52' }}>
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
