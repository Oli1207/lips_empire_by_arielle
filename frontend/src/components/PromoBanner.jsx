import { useEffect, useState } from 'react'
import { getStoredPromo, clearPromo, applyPromoCode } from '../utils/promo'

function PromoBanner() {
  const [promo, setPromo] = useState(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const refresh = () => setPromo(getStoredPromo())

  useEffect(() => {
    refresh()
    window.addEventListener('promo-changed', refresh)
    return () => window.removeEventListener('promo-changed', refresh)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    setTimeout(() => {
      clearPromo()
      setDismissed(false)
    }, 300)
  }

  const handleManualApply = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setError('')
    const result = await applyPromoCode(input.trim())
    setLoading(false)
    if (result) {
      setInput('')
    } else {
      setError('Code invalide ou expiré')
    }
  }

  if (promo && !dismissed) {
    return (
      <div style={{
        background: 'linear-gradient(90deg, #ff6b9d 0%, #c44569 100%)',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontSize: 14,
        fontWeight: 600,
        position: 'relative',
        zIndex: 1000,
        transition: 'opacity 0.3s',
        opacity: dismissed ? 0 : 1,
      }}>
        <span>
          Code <strong style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: 4 }}>{promo.code}</strong> actif — <strong>{promo.discount}%</strong> de réduction appliqué !
        </span>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: 'none', color: '#fff',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
            padding: '0 4px', opacity: 0.8,
          }}
          aria-label="Fermer"
        >×</button>
      </div>
    )
  }

  return null
}

export default PromoBanner
