import React, { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'
import Swal from 'sweetalert2'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'

function Stars({ n }) {
  return <span>{Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? '#f59e0b' : '#e5e7eb', fontSize: 14 }}>★</span>
  ))}</span>
}

function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    const params = filter !== 'all' ? { active: filter === 'active' } : {}
    adminAxios.get('admin/reviews/', { params })
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const approve = async (id) => {
    await adminAxios.patch(`admin/reviews/${id}/`, { active: true })
    load()
  }

  const reject = async (id) => {
    await adminAxios.patch(`admin/reviews/${id}/`, { active: false })
    load()
  }

  const del = async (id) => {
    const result = await Swal.fire({
      icon: 'warning', title: 'Supprimer cet avis ?',
      showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
    })
    if (!result.isConfirmed) return
    await adminAxios.delete(`admin/reviews/${id}/`); load()
  }

  return (
    <div>
      <h4 style={{ marginBottom: 6, fontWeight: 700, color: DARK }}>Avis clients</h4>
      <p style={{ marginBottom: 20, fontSize: 13, color: '#888' }}>{reviews.length} avis</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'Tous'], ['pending', 'En attente'], ['active', 'Publiés']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none',
            background: filter === val ? DARK : '#f3f4f6',
            color: filter === val ? '#fff' : '#666',
          }}>{label}</button>
        ))}
      </div>

      {loading ? <p style={{ color: '#aaa' }}>Chargement…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: DARK }}>
                    {r.user?.full_name || r.user?.email || 'Anonyme'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>
                    {r.product?.title || 'Produit'} — {new Date(r.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Stars n={r.rating} />
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                    background: r.active ? '#d1fae5' : '#fef3c7',
                    color: r.active ? '#065f46' : '#92400e',
                  }}>{r.active ? 'Publié' : 'En attente'}</span>
                </div>
              </div>

              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#555', lineHeight: 1.6 }}>{r.review}</p>

              <div style={{ display: 'flex', gap: 8 }}>
                {!r.active && (
                  <button onClick={() => approve(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#d1fae5', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, color: '#065f46', cursor: 'pointer', fontWeight: 500 }}>
                    <CheckCircle size={14} /> Approuver
                  </button>
                )}
                {r.active && (
                  <button onClick={() => reject(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fef3c7', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, color: '#92400e', cursor: 'pointer', fontWeight: 500 }}>
                    <XCircle size={14} /> Retirer
                  </button>
                )}
                <button onClick={() => del(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fee2e2', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, color: '#991b1b', cursor: 'pointer', fontWeight: 500 }}>
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>Aucun avis</p>}
        </div>
      )}
    </div>
  )
}

export default AdminReviews
