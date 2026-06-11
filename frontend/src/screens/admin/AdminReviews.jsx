import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/auth'
import apiInstance from '../../utils/axios'

const BACKEND = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api/v1/', '') || ''

const STATUS_LABELS = {
  pending: { label: 'En attente', color: '#d97706', bg: '#fef3c7' },
  approved: { label: 'Approuve', color: '#065f46', bg: '#d1fae5' },
  rejected: { label: 'Refuse', color: '#991b1b', bg: '#fee2e2' },
}

function StatusBadge({ status }) {
  const s = STATUS_LABELS[status] || STATUS_LABELS.pending
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: '3px 9px',
      borderRadius: 20, letterSpacing: 0.3,
    }}>{s.label}</span>
  )
}

function StarDisplay({ rating }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 13 }}>
      {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
    </span>
  )
}

function PhotosRow({ photos }) {
  if (!photos || photos.length === 0) return null
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
      {photos.map((ph, i) => (
        <a key={i} href={`${BACKEND}${ph.image}`} target="_blank" rel="noreferrer">
          <img
            src={`${BACKEND}${ph.image}`}
            alt=""
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 7, border: '1px solid #f0f0f0', cursor: 'zoom-in' }}
          />
        </a>
      ))}
    </div>
  )
}

function ReviewRow({ review, onAction }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0',
      borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={review.status} />
            {review.is_featured && (
              <span style={{ background: '#fdf6f4', color: '#c44569', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid #fedbd1' }}>
                Mis en avant
              </span>
            )}
            {review.is_verified_purchase && (
              <span style={{ background: '#f0fdf4', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
                Achat verifie
              </span>
            )}
            {review.is_global && (
              <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid #bfdbfe' }}>
                Avis global
              </span>
            )}
          </div>
          <div style={{ marginTop: 5, display: 'flex', gap: 12, alignItems: 'center' }}>
            <StarDisplay rating={review.rating} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>
              {review.reviewer_name || 'Anonyme'}
            </span>
            <span style={{ fontSize: 12, color: '#aaa' }}>
              {review.reviewer_email}
            </span>
          </div>
          {review.product_title && (
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888' }}>
              Produit : {review.product_title}
            </p>
          )}
          <p style={{
            margin: '6px 0 0', fontSize: 13, color: '#555',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 500,
          }}>
            {review.review}
          </p>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#bbb" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #f9f9f9', padding: '16px 18px', background: '#fafafa' }}>
          <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, margin: '0 0 10px' }}>
            "{review.review}"
          </p>
          <PhotosRow photos={review.photos} />

          <div style={{
            marginTop: 16, background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#92400e' }}>
              Que faire avec cet avis ?
            </p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#78350f', lineHeight: 1.8 }}>
              <li><strong>Approuver</strong> : l'avis sera visible publiquement sur le site</li>
              <li><strong>Refuser</strong> : l'avis reste cache, la cliente ne le sait pas</li>
              <li><strong>Mettre en avant</strong> : l'avis apparaitra dans le carousel de la page d'accueil</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {review.status !== 'approved' && (
              <button
                onClick={() => onAction(review.id, 'approve')}
                style={{
                  background: '#065f46', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '9px 18px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Approuver
              </button>
            )}
            {review.status !== 'rejected' && (
              <button
                onClick={() => onAction(review.id, 'reject')}
                style={{
                  background: '#991b1b', color: '#fff',
                  border: 'none', borderRadius: 8, padding: '9px 18px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Refuser
              </button>
            )}
            <button
              onClick={() => onAction(review.id, 'toggle_featured')}
              style={{
                background: review.is_featured ? '#c44569' : '#fff',
                color: review.is_featured ? '#fff' : '#c44569',
                border: '1px solid #c44569',
                borderRadius: 8, padding: '9px 18px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {review.is_featured ? 'Retirer du carousel' : 'Mettre en avant (carousel)'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const { allUserData } = useAuthStore()

  const load = (status) => {
    setLoading(true)
    const q = status !== 'all' ? `?status=${status}` : ''
    apiInstance.get(`admin/reviews-manage/${q}`, {
      headers: { Authorization: `Bearer ${allUserData?.access}` }
    }).then(r => {
      setReviews(r.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(filter) }, [filter])

  const handleAction = async (pk, action) => {
    await apiInstance.patch(`admin/reviews-manage/${pk}/`, { action }, {
      headers: { Authorization: `Bearer ${allUserData?.access}` }
    })
    load(filter)
  }

  const pendingCount = filter === 'pending' ? reviews.length : 0

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1a1a1a', margin: '0 0 6px' }}>
          Gestion des avis clients
        </h2>
        <p style={{ margin: 0, color: '#888', fontSize: 14, lineHeight: 1.6 }}>
          Ici vous pouvez lire les avis laisses par vos clientes, les approuver ou les refuser avant publication,
          et choisir lesquels apparaissent en evidence sur la page d'accueil.
          <br />
          <strong style={{ color: '#c44569' }}>Un avis non approuve n'est jamais visible par le public.</strong>
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'pending', label: "En attente d'approbation" },
          { key: 'approved', label: 'Approuves' },
          { key: 'rejected', label: 'Refuses' },
          { key: 'all', label: 'Tous' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              border: filter === f.key ? 'none' : '1px solid #e5e7eb',
              background: filter === f.key ? '#1a1a1a' : '#fff',
              color: filter === f.key ? '#fedbd1' : '#555',
              borderRadius: 8, padding: '8px 16px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {f.label}
            {f.key === 'pending' && pendingCount > 0 && (
              <span style={{
                marginLeft: 6, background: '#c44569', color: '#fff',
                borderRadius: 20, fontSize: 10, padding: '1px 6px', fontWeight: 700,
              }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Chargement...</p>
      ) : reviews.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0',
        }}>
          <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>
            {filter === 'pending'
              ? 'Aucun avis en attente — tout est a jour !'
              : 'Aucun avis dans cette categorie.'}
          </p>
        </div>
      ) : (
        reviews.map(r => <ReviewRow key={r.id} review={r} onAction={handleAction} />)
      )}
    </div>
  )
}
