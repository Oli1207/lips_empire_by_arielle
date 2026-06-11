import { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'

function FeedbackRow({ fb, onMarkRead }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      background: fb.is_read ? '#fff' : '#fff8f6',
      border: `1px solid ${fb.is_read ? '#f0f0f0' : '#fedbd1'}`,
      borderRadius: 14, marginBottom: 10, overflow: 'hidden',
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            {!fb.is_read && (
              <span style={{
                background: '#c44569', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '2px 7px',
                borderRadius: 20, letterSpacing: 0.3,
              }}>Nouveau</span>
            )}
            <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>
              {fb.name || 'Anonyme'}
            </span>
            {fb.email && (
              <span style={{ fontSize: 12, color: '#aaa' }}>{fb.email}</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#ccc' }}>
              {new Date(fb.created_at).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <p style={{
            margin: 0, fontSize: 13, color: '#555',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 520,
          }}>
            {fb.message}
          </p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #f9f9f9', padding: '16px 18px', background: '#fafafa' }}>
          <p style={{ fontSize: 14, color: '#333', lineHeight: 1.8, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
            {fb.message}
          </p>

          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a',
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              Ce retour est <strong>prive</strong> — seule votre equipe peut le voir.
              {fb.email && <> Pour repondre : <strong>{fb.email}</strong></>}
            </p>
          </div>

          {!fb.is_read && (
            <button
              onClick={() => onMarkRead(fb.id)}
              style={{
                background: '#1a1a1a', color: '#fedbd1',
                border: 'none', borderRadius: 8, padding: '9px 18px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Marquer comme lu
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([])
  const [showUnread, setShowUnread] = useState(true)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminAxios.get('admin/feedbacks/', {
}).then(r => setFeedbacks(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (pk) => {
    await adminAxios.patch(`admin/feedbacks/${pk}/`, { is_read: true }, {
})
    load()
  }

  const unreadCount = feedbacks.filter(f => !f.is_read).length
  const displayed = showUnread ? feedbacks.filter(f => !f.is_read) : feedbacks

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1a1a1a', margin: '0 0 6px' }}>
          Retours prives des clientes
        </h2>
        <p style={{ margin: 0, color: '#888', fontSize: 14, lineHeight: 1.6 }}>
          Ces messages ont ete envoyes en prive par vos clientes — ils ne sont jamais publics.
          Une cliente peut envoyer un retour depuis le lien dans l'email de demande d'avis,
          ou directement depuis la page du site.
          <br />
          {unreadCount > 0 && (
            <strong style={{ color: '#c44569' }}>
              Vous avez {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}.
            </strong>
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setShowUnread(true)}
          style={{
            border: showUnread ? 'none' : '1px solid #e5e7eb',
            background: showUnread ? '#1a1a1a' : '#fff',
            color: showUnread ? '#fedbd1' : '#555',
            borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Non lus
          {unreadCount > 0 && (
            <span style={{ marginLeft: 6, background: '#c44569', color: '#fff', borderRadius: 20, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowUnread(false)}
          style={{
            border: !showUnread ? 'none' : '1px solid #e5e7eb',
            background: !showUnread ? '#1a1a1a' : '#fff',
            color: !showUnread ? '#fedbd1' : '#555',
            borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Tous ({feedbacks.length})
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Chargement...</p>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0' }}>
          <p style={{ color: '#aaa', fontSize: 14, margin: 0 }}>
            {showUnread ? 'Aucun message non lu.' : 'Aucun message recu.'}
          </p>
        </div>
      ) : (
        displayed.map(f => <FeedbackRow key={f.id} fb={f} onMarkRead={markRead} />)
      )}
    </div>
  )
}
