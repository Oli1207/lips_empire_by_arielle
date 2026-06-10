import React, { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'
import Swal from 'sweetalert2'

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'

const STATUS_COLORS = {
  Pending:   { bg: '#fef3c7', color: '#92400e' },
  Fulfilled: { bg: '#d1fae5', color: '#065f46' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
}
const PAY_COLORS = {
  paid:       { bg: '#d1fae5', color: '#065f46' },
  pending:    { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
}

function Badge({ val, map }) {
  const s = map[val] || { bg: '#f3f4f6', color: '#666' }
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color }}>{val}</span>
}

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', payment: '' })
  const [selected, setSelected] = useState(null)

  const load = () => {
    const params = {}
    if (filter.status) params.status = filter.status
    if (filter.payment) params.payment = filter.payment
    adminAxios.get('admin/orders/', { params })
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (oid, order_status) => {
    await adminAxios.patch(`admin/orders/${oid}/`, { order_status })
    load()
    setSelected(prev => prev ? { ...prev, order_status } : null)
    Swal.fire({ icon: 'success', title: 'Statut mis à jour', timer: 1500, showConfirmButton: false })
  }

  return (
    <div>
      <h4 style={{ marginBottom: 6, fontWeight: 700, color: DARK }}>Commandes</h4>
      <p style={{ marginBottom: 20, fontSize: 13, color: '#888' }}>{orders.length} commande(s)</p>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'status', label: 'Statut', options: ['', 'Pending', 'Fulfilled', 'Cancelled'] },
          { key: 'payment', label: 'Paiement', options: ['', 'paid', 'pending', 'cancelled'] },
        ].map(({ key, label, options }) => (
          <select
            key={key}
            value={filter[key]}
            onChange={e => setFilter(f => ({ ...f, [key]: e.target.value }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, background: '#fff', cursor: 'pointer' }}
          >
            {options.map(o => <option key={o} value={o}>{o || `Tous (${label})`}</option>)}
          </select>
        ))}
      </div>

      {loading ? <p style={{ color: '#aaa' }}>Chargement…</p> : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['#', 'Client', 'Email', 'Total', 'Pays', 'Paiement', 'Statut', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#888', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.oid} style={{ borderTop: '1px solid #f5f5f5', cursor: 'pointer' }} onClick={() => setSelected(o)}>
                  <td style={{ padding: '10px 14px', color: '#aaa', fontSize: 11 }}>{o.oid}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{o.full_name}</td>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{o.email}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#b85c3a' }}>{parseFloat(o.total).toFixed(2)} CAD</td>
                  <td style={{ padding: '10px 14px' }}>{o.country}</td>
                  <td style={{ padding: '10px 14px' }}><Badge val={o.payment_status} map={PAY_COLORS} /></td>
                  <td style={{ padding: '10px 14px' }}><Badge val={o.order_status} map={STATUS_COLORS} /></td>
                  <td style={{ padding: '10px 14px', color: '#aaa', fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={e => { e.stopPropagation(); setSelected(o) }} style={{ background: BRAND, border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Détail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>Aucune commande</p>}
        </div>
      )}

      {/* Modal détail */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: DARK }}>Commande #{selected.oid}</h5>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20, fontSize: 13 }}>
              {[
                ['Client', selected.full_name],
                ['Email', selected.email],
                ['Téléphone', selected.mobile],
                ['Pays', selected.country],
                ['Ville', selected.city],
                ['Province', selected.state],
                ['Adresse', selected.address],
                ['Code postal', selected.postal_code],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ color: '#aaa', fontSize: 11 }}>{k}</span>
                  <p style={{ margin: '2px 0 0', fontWeight: 500 }}>{v || '—'}</p>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />

            <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Produits</p>
            {selected.orderitem?.map(item => (
              <div key={item.oid} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f9f9f9', fontSize: 13 }}>
                <span>{item.qty}x {item.product?.title || 'Produit'}</span>
                <span style={{ fontWeight: 600 }}>{parseFloat(item.total).toFixed(2)} CAD</span>
              </div>
            ))}

            <div style={{ marginTop: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#888' }}>
                <span>Sous-total</span><span>{parseFloat(selected.sub_total).toFixed(2)} CAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#888' }}>
                <span>Livraison</span><span>{parseFloat(selected.shipping_amount).toFixed(2)} CAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#888' }}>
                <span>Frais Stripe</span><span>{parseFloat(selected.service_fee).toFixed(2)} CAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, fontSize: 15, borderTop: '1px solid #f0f0f0', marginTop: 4 }}>
                <span>Total</span><span style={{ color: '#b85c3a' }}>{parseFloat(selected.total).toFixed(2)} CAD</span>
              </div>
            </div>

            {selected.shipment_id && (
              <a href={`https://chitchats.com/tracking/${selected.shipment_id.toLowerCase()}/`} target="_blank" rel="noreferrer"
                style={{ display: 'block', textAlign: 'center', marginTop: 16, background: '#1a1a1a', color: '#fff', padding: '10px 0', borderRadius: 8, fontSize: 13, textDecoration: 'none' }}>
                Voir le suivi ChitChats →
              </a>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '20px 0' }} />

            <p style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Changer le statut</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Pending', 'Fulfilled', 'Cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => updateStatus(selected.oid, s)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, border: `2px solid ${selected.order_status === s ? '#1a1a1a' : '#e5e7eb'}`,
                    background: selected.order_status === s ? '#1a1a1a' : '#fff',
                    color: selected.order_status === s ? '#fedbd1' : '#666',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
