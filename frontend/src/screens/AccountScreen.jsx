import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiInstance from '../utils/axios'
import UserData from '../plugin/UserData'
import SEO from '../components/SEO'

const STATUS_LABELS = {
  Pending: { label: 'En attente', color: '#92400e', bg: '#fef3c7' },
  Fulfilled: { label: 'Expédiée', color: '#065f46', bg: '#d1fae5' },
  Cancelled: { label: 'Annulée', color: '#991b1b', bg: '#fee2e2' },
}
const PAY_LABELS = {
  paid: { label: 'Payée', color: '#065f46', bg: '#d1fae5' },
  pending: { label: 'En attente', color: '#92400e', bg: '#fef3c7' },
  processing: { label: 'En cours', color: '#1e40af', bg: '#dbeafe' },
  cancelled: { label: 'Annulée', color: '#991b1b', bg: '#fee2e2' },
}

function Badge({ map, val }) {
  const m = map[val] || { label: val, color: '#555', bg: '#f3f4f6' }
  return (
    <span style={{
      background: m.bg, color: m.color,
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
    }}>{m.label}</span>
  )
}

function AccountScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const userData = UserData()
  const navigate = useNavigate()

  useEffect(() => {
    if (!userData) { navigate('/login'); return }
    apiInstance.get(`customer/orders/${userData.user_id}/`)
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userData])

  if (!userData) return null

  return (
    <main style={{ marginTop: 80, marginBottom: 60 }}>
      <SEO title="Mon compte" noindex={true} />
      <div className="container" style={{ maxWidth: 760 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>Mon compte</h2>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>{userData.email}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Commandes', val: orders.length },
            { label: 'En cours', val: orders.filter(o => o.order_status === 'Pending').length },
            { label: 'Expédiées', val: orders.filter(o => o.order_status === 'Fulfilled').length },
          ].map(({ label, val }) => (
            <div key={label} style={{
              background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12,
              padding: '16px', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>{val}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Liste commandes */}
        <h4 style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Mes commandes</h4>

        {loading && <p style={{ color: '#aaa', textAlign: 'center', padding: 40 }}>Chargement…</p>}

        {!loading && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
            <p style={{ fontSize: 40, marginBottom: 12, color: '#e0c0bc' }}>—</p>
            <p style={{ fontSize: 16 }}>Aucune commande pour l'instant.</p>
            <Link to="/" style={{
              display: 'inline-block', marginTop: 16,
              background: '#1a1a1a', color: '#fedbd1',
              padding: '12px 28px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 700,
            }}>Découvrir nos produits</Link>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => (
            <div key={o.oid} style={{
              background: '#fff', border: '1px solid #f0f0f0',
              borderRadius: 14, overflow: 'hidden',
            }}>
              {/* Row commande */}
              <div
                onClick={() => setExpanded(expanded === o.oid ? null : o.oid)}
                style={{
                  padding: '14px 18px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                }}
              >
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
                    Commande #{o.oid}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#aaa' }}>
                    {new Date(o.date).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Badge map={PAY_LABELS} val={o.payment_status} />
                  <Badge map={STATUS_LABELS} val={o.order_status} />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{o.total} CAD</span>
                  <span style={{ color: '#ccc' }}>{expanded === o.oid ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Détail expandable */}
              {expanded === o.oid && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px' }}>
                  {/* Articles */}
                  <div style={{ marginBottom: 16 }}>
                    {(o.orderitem || []).map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '8px 0', borderBottom: '1px solid #f9f9f9',
                        fontSize: 13, color: '#555',
                      }}>
                        <span>{item.product?.title}</span>
                        <span style={{ fontWeight: 600 }}>{item.qty} × {item.price} CAD</span>
                      </div>
                    ))}
                  </div>

                  {/* Totaux */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#888' }}>
                    <span>Livraison</span><span>{o.shipping_amount} CAD</span>
                  </div>
                  {parseFloat(o.saved) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#16a34a' }}>
                      <span>Réduction</span><span>−{o.saved} CAD</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, color: '#1a1a1a', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                    <span>Total</span><span>{o.total} CAD</span>
                  </div>

                  {/* Adresse */}
                  <p style={{ marginTop: 16, fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>
                    <strong style={{ color: '#555' }}>Livraison à</strong><br />
                    {o.full_name} · {o.address}, {o.city}, {o.state} {o.postal_code} — {o.country}
                  </p>

                  {/* Lien de suivi */}
                  {o.shipment_id && (
                    <a
                      href={`https://chitchats.com/tracking/${o.shipment_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                        background: '#1a1a1a', color: '#fedbd1',
                        padding: '10px 18px', borderRadius: 8,
                        textDecoration: 'none', fontSize: 13, fontWeight: 700,
                      }}
                    >
                      Suivre mon colis
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default AccountScreen
