import { useEffect, useRef, useState } from 'react'
import apiInstance from '../utils/axios'

const BACKEND = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api/v1/', '') || ''

function StarDisplay({ rating }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

function ReviewCard({ review }) {
  const photo = review.photos?.[0]
  const hasPhoto = !!photo

  return (
    <div style={{
      minWidth: 260,
      maxWidth: 260,
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1px solid #f0f0f0',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Photo en tete si dispo, sinon bloc colore */}
      {hasPhoto ? (
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img
            src={`${BACKEND}${photo.image}`}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{
          height: 72,
          background: 'linear-gradient(135deg, #fedbd1 0%, #f9a8c9 100%)',
        }} />
      )}

      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StarDisplay rating={review.rating} />
        <p style={{
          margin: '8px 0 12px',
          fontSize: 13.5,
          color: '#333',
          lineHeight: 1.6,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          "{review.review}"
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: '#fedbd1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#c44569', flexShrink: 0,
          }}>
            {(review.reviewer_name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>
              {review.reviewer_name || 'Cliente'}
            </p>
            {review.product_title && (
              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{review.product_title}</p>
            )}
            {!review.product_title && review.is_global && (
              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>Avis global</p>
            )}
          </div>
          {review.is_verified_purchase && (
            <span style={{
              marginLeft: 'auto',
              background: '#f0fdf4', color: '#065f46',
              fontSize: 10, padding: '2px 7px',
              borderRadius: 20, border: '1px solid #bbf7d0',
              fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              Achat verifie
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReviewCarousel() {
  const [reviews, setReviews] = useState([])
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(0)
  const scrollStart = useRef(0)

  useEffect(() => {
    apiInstance.get('reviews/featured/', { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } }).then(r => {
      setReviews(r.data)
    }).catch(() => {})
  }, [])

  if (reviews.length === 0) return null

  const onMouseDown = (e) => {
    setIsDragging(true)
    dragStart.current = e.clientX
    scrollStart.current = trackRef.current.scrollLeft
  }
  const onMouseMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current
    trackRef.current.scrollLeft = scrollStart.current - dx
  }
  const onMouseUp = () => setIsDragging(false)

  return (
    <section style={{ padding: '48px 0', background: '#fdf6f4' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: '#1a1a1a', margin: '0 0 4px' }}>
              Ce qu'elles disent
            </h2>
            <p style={{ margin: 0, color: '#aaa', fontSize: 14 }}>
              Avis verifies de nos clientes
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => trackRef.current.scrollBy({ left: -280, behavior: 'smooth' })}
              style={{
                background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 8, width: 36, height: 36,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              onClick={() => trackRef.current.scrollBy({ left: 280, behavior: 'smooth' })}
              style={{
                background: '#1a1a1a', border: 'none',
                borderRadius: 8, width: 36, height: 36,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fedbd1" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingLeft: 'max(16px, calc((100vw - 1200px) / 2))',
          paddingRight: 24,
          paddingBottom: 8,
          scrollbarWidth: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
    </section>
  )
}
