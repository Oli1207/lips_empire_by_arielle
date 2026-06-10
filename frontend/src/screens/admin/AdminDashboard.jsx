import React, { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'
import { TrendingUp, ShoppingBag, Clock, AlertTriangle } from 'lucide-react'

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'

function StatCard({ icon: Icon, label, value, sub, color = BRAND }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={DARK} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 700, color: DARK }}>{value}</p>
        {sub && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aaa' }}>{sub}</p>}
      </div>
    </div>
  )
}

function MiniBar({ data, maxVal }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 60 }}>
      {data.map((d, i) => {
        const h = maxVal > 0 ? Math.max(2, Math.round((d.revenue / maxVal) * 60)) : 2
        const isToday = i === data.length - 1
        return (
          <div
            key={d.date}
            title={`${d.date}: ${d.revenue.toFixed(2)} CAD`}
            style={{ flex: 1, height: h, background: isToday ? '#b85c3a' : BRAND, borderRadius: 2, transition: 'height 0.3s' }}
          />
        )
      })}
    </div>
  )
}

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAxios.get('admin/dashboard/')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Chargement…</div>
  if (!data) return <div style={{ color: 'red' }}>Erreur de chargement</div>

  const maxRev = Math.max(...data.daily_revenue.map(d => d.revenue), 1)

  return (
    <div>
      <h4 style={{ marginBottom: 6, fontWeight: 700, color: DARK }}>Dashboard</h4>
      <p style={{ marginBottom: 28, fontSize: 13, color: '#888' }}>Vue d'ensemble de votre activité</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={TrendingUp} label="Revenus aujourd'hui" value={`${data.revenue.today.toFixed(2)} CAD`} sub={`${data.revenue.month.toFixed(2)} CAD ce mois`} />
        <StatCard icon={ShoppingBag} label="Commandes total" value={data.orders.total} sub={`${data.orders.today} aujourd'hui`} />
        <StatCard icon={Clock} label="En attente" value={data.orders.pending} sub="commandes à préparer" color="#fde8c0" />
        <StatCard icon={AlertTriangle} label="Rupture de stock" value={data.stock.out_of_stock} sub={`${data.stock.low_stock.length} produits faibles`} color="#fdd" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Graphe revenus */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 14, color: DARK }}>Revenus — 30 derniers jours</p>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#aaa' }}>{data.revenue.total.toFixed(2)} CAD total</p>
          <MiniBar data={data.daily_revenue} maxVal={maxRev} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: '#ccc' }}>{data.daily_revenue[0]?.date?.slice(5)}</span>
            <span style={{ fontSize: 10, color: '#ccc' }}>{data.daily_revenue[data.daily_revenue.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Top produits */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 14, color: DARK }}>Top produits vendus</p>
          {data.top_products.length === 0 && <p style={{ color: '#aaa', fontSize: 13 }}>Aucune donnée</p>}
          {data.top_products.map((p, i) => (
            <div key={p['product__id']} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < data.top_products.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                <span style={{ fontSize: 13, color: DARK }}>{p['product__title']}</span>
              </div>
              <span style={{ fontSize: 12, color: '#888' }}>{p.total_sold} vendus</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock faible */}
      {data.stock.low_stock.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 14, color: '#92400e' }}>Stock faible</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.stock.low_stock.map(p => (
              <span key={p.id} style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                {p.title} — {p.stock_qty} restant(s)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dernières commandes */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #eee' }}>
        <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 14, color: DARK }}>Dernières commandes</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['ID', 'Client', 'Total', 'Pays', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#888', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent_orders.map(o => (
                <tr key={o.oid} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px', color: '#888', fontSize: 11 }}>{o.oid}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{o.full_name}</td>
                  <td style={{ padding: '10px 12px', color: '#b85c3a', fontWeight: 600 }}>{parseFloat(o.total).toFixed(2)} CAD</td>
                  <td style={{ padding: '10px 12px' }}>{o.country}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      background: o.order_status === 'Fulfilled' ? '#d1fae5' : o.order_status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                      color: o.order_status === 'Fulfilled' ? '#065f46' : o.order_status === 'Cancelled' ? '#991b1b' : '#92400e',
                    }}>{o.order_status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#aaa', fontSize: 11 }}>{new Date(o.date).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
