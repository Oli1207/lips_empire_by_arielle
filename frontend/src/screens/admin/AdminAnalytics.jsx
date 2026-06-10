import React, { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'
import { Users, MousePointer, TrendingUp, Smartphone } from 'lucide-react'

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'

const EVENT_LABELS = {
  page_view: 'Vues de pages',
  view_product: 'Vues produit',
  add_to_cart: 'Ajouts panier',
  begin_checkout: 'Débuts checkout',
  purchase: 'Achats',
  search: 'Recherches',
}

function MiniBarChart({ data, valueKey, labelKey, color = BRAND }) {
  if (!data?.length) return <p style={{ color: '#aaa', fontSize: 12 }}>Aucune donnée</p>
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 12 }}>
            <span style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
              {EVENT_LABELS[d[labelKey]] || d[labelKey] || '—'}
            </span>
            <span style={{ color: '#888', fontWeight: 600 }}>{d[valueKey]}</span>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${Math.round(d[valueKey] / max * 100)}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function SessionsChart({ data }) {
  if (!data?.length) return null
  const max = Math.max(...data.map(d => d.sessions), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
      {data.map((d, i) => {
        const h = max > 0 ? Math.max(2, Math.round(d.sessions / max * 60)) : 2
        return (
          <div key={d.date} title={`${d.date}: ${d.sessions} sessions`}
            style={{ flex: 1, height: h, background: i === data.length - 1 ? '#b85c3a' : BRAND, borderRadius: 2 }} />
        )
      })}
    </div>
  )
}

function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pushStatus, setPushStatus] = useState('idle')

  useEffect(() => {
    adminAxios.get('admin/analytics/')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const subscribePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Notifications push non supportées sur ce navigateur.')
      return
    }
    try {
      setPushStatus('pending')
      const reg = await navigator.serviceWorker.ready
      const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

      if (!VAPID_PUBLIC_KEY) {
        alert('Clé VAPID publique non configurée. Ajoutez VITE_VAPID_PUBLIC_KEY dans .env')
        setPushStatus('idle')
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await adminAxios.post('push/subscribe/', sub.toJSON())
      setPushStatus('subscribed')
    } catch (e) {
      console.error(e)
      setPushStatus('error')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Chargement…</div>
  if (!data) return <div style={{ color: 'red' }}>Erreur</div>

  return (
    <div>
      <h4 style={{ marginBottom: 6, fontWeight: 700, color: DARK }}>Analytics</h4>
      <p style={{ marginBottom: 24, fontSize: 13, color: '#888' }}>30 derniers jours</p>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: Users,        label: 'Sessions (30j)', val: data.sessions['30d'] },
          { icon: Users,        label: 'Sessions (7j)',  val: data.sessions['7d'] },
          { icon: MousePointer, label: 'Taux conversion', val: `${data.conversion_rate}%` },
          { icon: TrendingUp,   label: 'Achats (30j)',   val: data.events_by_type.find(e => e.event_type === 'purchase')?.count || 0 },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} color={DARK} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 700, color: DARK }}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Sessions par jour */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 14, color: DARK }}>Sessions par jour</p>
          <SessionsChart data={data.daily_sessions} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 10, color: '#ccc' }}>{data.daily_sessions[0]?.date?.slice(5)}</span>
            <span style={{ fontSize: 10, color: '#ccc' }}>{data.daily_sessions[data.daily_sessions.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Events par type */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 16px', fontWeight: 600, fontSize: 14, color: DARK }}>Événements (30j)</p>
          <MiniBarChart data={data.events_by_type} valueKey="count" labelKey="event_type" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18, marginBottom: 18 }}>
        {/* Top pages */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: 14, color: DARK }}>Top pages</p>
          <MiniBarChart data={data.top_pages} valueKey="count" labelKey="page" color="#a5b4fc" />
        </div>

        {/* Top produits vus */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: 14, color: DARK }}>Produits les plus vus</p>
          <MiniBarChart data={data.top_products_viewed} valueKey="count" labelKey="product__title" color="#fca5a5" />
        </div>

        {/* Devices */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #eee' }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: 14, color: DARK }}>Appareils</p>
          {data.devices.map(d => (
            <div key={d.device_type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9f9f9', fontSize: 13 }}>
              <span style={{ color: '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={13} /> {d.device_type || 'Inconnu'}
              </span>
              <span style={{ fontWeight: 600, color: DARK }}>{d.count}</span>
            </div>
          ))}
          {data.sources?.length > 0 && (
            <>
              <p style={{ margin: '16px 0 10px', fontWeight: 600, fontSize: 13, color: DARK }}>Sources UTM</p>
              {data.sources.map(s => (
                <div key={s.utm_source} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#666' }}>
                  <span>{s.utm_source}</span><span style={{ fontWeight: 600 }}>{s.count}</span>
                </div>
              ))}
            </>
          )}
          {data.top_campaigns?.length > 0 && (
            <>
              <p style={{ margin: '16px 0 10px', fontWeight: 600, fontSize: 13, color: DARK }}>Campagnes</p>
              {data.top_campaigns.map(c => (
                <div key={c.utm_campaign} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#666' }}>
                  <span>{c.utm_campaign}</span><span style={{ fontWeight: 600 }}>{c.count}</span>
                </div>
              ))}
            </>
          )}
          {data.top_refs?.length > 0 && (
            <>
              <p style={{ margin: '16px 0 10px', fontWeight: 600, fontSize: 13, color: DARK }}>Influenceurs / ref</p>
              {data.top_refs.map(r => (
                <div key={r.ref} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#666' }}>
                  <span>{r.ref}</span><span style={{ fontWeight: 600 }}>{r.count}</span>
                </div>
              ))}
            </>
          )}
          {data.top_content?.length > 0 && (
            <>
              <p style={{ margin: '16px 0 10px', fontWeight: 600, fontSize: 13, color: DARK }}>Contenus (utm_content)</p>
              {data.top_content.map(c => (
                <div key={c.utm_content} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#666' }}>
                  <span>{c.utm_content}</span><span style={{ fontWeight: 600 }}>{c.count}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Push notification */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #eee' }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 14, color: DARK }}>Notifications push</p>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Recevez une notification sur ce navigateur à chaque nouvelle commande.</p>
        {pushStatus === 'subscribed'
          ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>Notifications activées</span>
          : pushStatus === 'error'
          ? <span style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 18px', borderRadius: 8, fontSize: 13 }}>Erreur — vérifiez la clé VAPID</span>
          : <button onClick={subscribePush} disabled={pushStatus === 'pending'} style={{ background: DARK, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
              {pushStatus === 'pending' ? 'Activation…' : 'Activer les notifications'}
            </button>
        }
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)))
}

export default AdminAnalytics
