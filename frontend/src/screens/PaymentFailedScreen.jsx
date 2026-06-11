import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react'

const ROSE = '#c44569'
const PEACH = '#fedbd1'
const DARK = '#1a1a1a'

export default function PaymentFailedScreen() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(150deg, #fce4dc 0%, #fedbd1 50%, #f2d8db 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 40px rgba(196,69,105,0.10)',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <XCircle size={40} color="#ef4444" />
        </div>

        <h2 style={{ fontWeight: 800, fontSize: 26, color: DARK, margin: '0 0 12px', letterSpacing: -0.5 }}>
          Paiement annule
        </h2>
        <p style={{ fontSize: 15, color: '#7a4a52', lineHeight: 1.7, margin: '0 0 8px' }}>
          Votre commande n'a pas ete completee.
        </p>
        <p style={{ fontSize: 14, color: '#b07a82', lineHeight: 1.6, margin: '0 0 36px' }}>
          Aucun montant n'a ete debite de votre compte.
          Les articles reserves ont ete remis en stock.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: DARK, color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} /> Revenir au paiement
          </button>

          <Link
            to="/"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: PEACH, color: DARK,
              border: 'none', borderRadius: 12,
              padding: '14px 24px', fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ShoppingBag size={18} /> Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}
