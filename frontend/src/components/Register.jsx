import { useState, useEffect } from 'react'
import { register } from '../utils/auth'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import Swal from 'sweetalert2'
import logo from './logo_arielle.png'
import { Eye, EyeOff } from 'lucide-react'

function Register() {
  const [full_name, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  useEffect(() => { if (isLoggedIn()) navigate('/') }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== password2) {
      Swal.fire({ icon: 'warning', title: 'Mots de passe differents', text: 'Les deux mots de passe ne correspondent pas.', confirmButtonColor: '#1a1a1a' })
      return
    }
    setIsLoading(true)
    const { error } = await register(full_name, email, phone, password, password2)
    if (error) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Le mot de passe doit contenir au moins 8 caracteres, une majuscule, une minuscule et un chiffre.', confirmButtonColor: '#1a1a1a' })
      setIsLoading(false)
    } else {
      Swal.fire({ icon: 'success', title: 'Compte cree !', text: "Bienvenue chez Lip's Empire by Arielle.", confirmButtonColor: '#1a1a1a', timer: 2000, showConfirmButton: false })
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
            Creer un compte
          </h2>
          <p style={{ margin: '0 0 28px', fontSize: 14, color: '#b07a82' }}>
            Rejoignez la communaute Lip's Empire
          </p>

          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>Nom complet</label>
              <input type="text" value={full_name} onChange={e => setFullname(e.target.value)}
                placeholder="Marie Dupont" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="marie@email.com" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>
                Numero de telephone <span style={{ color: '#c4a0a6', fontWeight: 400 }}>(optionnel)</span>
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+1 514 000 0000" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c44569', padding: 0 }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#c4a0a6' }}>
                8 caracteres minimum, une majuscule, un chiffre
              </p>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#7a4a52', display: 'block', marginBottom: 6 }}>Confirmer le mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd2 ? 'text' : 'password'} value={password2} onChange={e => setPassword2(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inputStyle, paddingRight: 42, borderColor: password2 && password !== password2 ? '#ef4444' : '#e8cfc8' }} />
                <button type="button" onClick={() => setShowPwd2(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c44569', padding: 0 }}>
                  {showPwd2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password2 && password !== password2 && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <button type="submit" disabled={isLoading}
              style={{
                width: '100%', padding: '13px',
                background: '#1a1a1a', color: '#fedbd1',
                border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}>
              {isLoading ? 'Creation...' : 'Creer mon compte'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#7a4a52' }}>
          Deja un compte ?{' '}
          <Link to="/login" style={{ color: '#c44569', fontWeight: 600, textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register
