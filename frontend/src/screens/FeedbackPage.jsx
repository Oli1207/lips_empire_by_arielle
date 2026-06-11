import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import apiInstance from '../utils/axios'
import SEO from '../components/SEO'

export default function FeedbackPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const orderOid = params.get('order')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!message.trim()) { alert('Veuillez ecrire votre message.'); return }
    setLoading(true)
    const payload = { name, email, message }
    if (token) payload.token = token
    if (orderOid) payload.order_oid = orderOid
    await apiInstance.post('feedback/submit/', payload)
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SEO title="Retour prive" noindex={true} />
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>
          <span style={{ background: '#fedbd1', borderRadius: '50%', width: 80, height: 80, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c44569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
        </div>
        <h2 style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>Message recu</h2>
        <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7 }}>
          Merci pour votre retour. Il est visible uniquement par notre equipe et nous vous repondrons si necessaire.
        </p>
      </div>
    </main>
  )

  return (
    <main style={{ marginTop: 80, marginBottom: 60 }}>
      <SEO title="Retour prive" noindex={true} />
      <div className="container" style={{ maxWidth: 560 }}>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>Retour prive</h2>
          <p style={{ color: '#888', fontSize: 14, margin: 0, lineHeight: 1.7 }}>
            Votre message sera lu uniquement par Arielle et son equipe. Il ne sera jamais publie.
            Que ce soit une critique, une question, ou un souci avec votre commande — parlez librement.
          </p>
        </div>

        <form onSubmit={submit} style={{
          background: '#fff', border: '1px solid #f0f0f0',
          borderRadius: 16, padding: '28px 30px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 4 }}>Prenom</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Marie (optionnel)"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pour vous repondre"
                type="email"
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: '#555', fontWeight: 600, display: 'block', marginBottom: 4 }}>Votre message *</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Partagez ce que vous pensez vraiment. Nous lisons tout."
              rows={6}
              style={{
                width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
                padding: '10px 12px', fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            background: '#1a1a1a', color: '#fedbd1',
            border: 'none', borderRadius: 10, padding: '14px 28px',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%',
          }}>
            {loading ? 'Envoi...' : 'Envoyer en prive'}
          </button>

          <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', margin: '14px 0 0' }}>
            Ce message est confidentiel et ne sera jamais publie.
          </p>
        </form>
      </div>
    </main>
  )
}
