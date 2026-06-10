import React, { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'
import Swal from 'sweetalert2'
import { Users, ShoppingCart, Heart, Mail, Package, Clock } from 'lucide-react'

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'

const SERVER = 'https://backend.lipsempirebyarielle.store'

const REMINDER_LABELS = {
  cart_abandon: 'Abandon panier',
  wishlist: 'Wishlist',
  low_stock: 'Stock faible',
}

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [sending, setSending] = useState(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    adminAxios.get('admin/users/')
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const sendReminder = async (user, type) => {
    const labels = { cart_abandon: 'abandon panier', wishlist: 'wishlist' }
    const confirm = await Swal.fire({
      title: `Envoyer un rappel ${labels[type]} ?`,
      html: `Un email sera envoyé à <b>${user.email}</b>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: DARK,
    })
    if (!confirm.isConfirmed) return

    setSending(`${user.id}-${type}`)
    try {
      await adminAxios.post('admin/send-reminder/', { user_id: user.id, type })
      Swal.fire({ icon: 'success', title: 'Email envoyé !', text: user.email, timer: 2000, showConfirmButton: false })
      load()
    } catch (err) {
      const msg = err?.response?.data?.error || 'Erreur lors de l\'envoi'
      Swal.fire({ icon: 'error', title: 'Impossible', text: msg })
    } finally {
      setSending(null)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>Chargement…</div>

  return (
    <div>
      <h4 style={{ marginBottom: 6, fontWeight: 700, color: DARK }}>Utilisateurs</h4>
      <p style={{ marginBottom: 20, fontSize: 13, color: '#888' }}>{users.length} client{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}</p>

      {/* Résumé rapide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: Users, label: 'Total clients', val: users.length },
          { icon: ShoppingCart, label: 'Paniers actifs', val: users.filter(u => u.cart_count > 0).length },
          { icon: Heart, label: 'Wishlists actives', val: users.filter(u => u.wishlist_count > 0).length },
          { icon: Package, label: 'Clients ayant commandé', val: users.filter(u => u.order_count > 0).length },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} color={DARK} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: DARK }}>{val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher par email ou nom…"
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }}
      />

      {/* Liste utilisateurs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(u => (
          <div key={u.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>

            {/* Header utilisateur */}
            <div
              onClick={() => setSelected(selected?.id === u.id ? null : u)}
              style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: DARK, flexShrink: 0 }}>
                  {(u.full_name || u.email)[0].toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: DARK }}>{u.full_name || u.email}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>{u.email} · depuis {u.date_joined}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {u.cart_count > 0 && (
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                    <ShoppingCart size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {u.cart_count} article{u.cart_count > 1 ? 's' : ''}
                  </span>
                )}
                {u.wishlist_count > 0 && (
                  <span style={{ background: '#fce7f3', color: '#9d174d', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                    <Heart size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {u.wishlist_count}
                  </span>
                )}
                {u.order_count > 0 && (
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>
                    {u.order_count} commande{u.order_count > 1 ? 's' : ''}
                  </span>
                )}
                <span style={{ color: '#ccc', fontSize: 18 }}>{selected?.id === u.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Détail expandable */}
            {selected?.id === u.id && (
              <div style={{ borderTop: '1px solid #f3f4f6', padding: '18px 18px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

                  {/* Panier */}
                  <div>
                    <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 13, color: DARK, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShoppingCart size={13} /> Panier ({u.cart_count} article{u.cart_count !== 1 ? 's' : ''})
                    </p>
                    {u.cart_items.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#ccc' }}>Panier vide</p>
                    ) : (
                      u.cart_items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #f9f9f9' }}>
                          {item.image && (
                            <img src={`${SERVER}/media/${item.image}`} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display='none'} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{item.qty} × {item.price} CAD</p>
                          </div>
                          {item.stock_qty <= 3 && (
                            <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 10, padding: '2px 6px', borderRadius: 99, whiteSpace: 'nowrap' }}>⚡ {item.stock_qty} restant{item.stock_qty > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      ))
                    )}
                    {u.cart_count > 0 && (
                      <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 600, color: '#c97b63' }}>Total : {u.cart_total.toFixed(2)} CAD</p>
                    )}
                  </div>

                  {/* Wishlist */}
                  <div>
                    <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: 13, color: DARK, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Heart size={13} /> Wishlist ({u.wishlist_count} article{u.wishlist_count !== 1 ? 's' : ''})
                    </p>
                    {u.wishlist_items.length === 0 ? (
                      <p style={{ fontSize: 12, color: '#ccc' }}>Wishlist vide</p>
                    ) : (
                      u.wishlist_items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid #f9f9f9' }}>
                          {item.image && (
                            <img src={`${SERVER}/media/${item.image}`} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} onError={e => e.target.style.display='none'} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#999' }}>{item.price} CAD</p>
                          </div>
                          {item.stock_qty <= 3 && (
                            <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 10, padding: '2px 6px', borderRadius: 99, whiteSpace: 'nowrap' }}>⚡ {item.stock_qty} restant{item.stock_qty > 1 ? 's' : ''}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Dernier rappel */}
                {u.last_reminder_type && (
                  <div style={{ background: '#fafafa', borderRadius: 8, padding: '8px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={12} color="#aaa" />
                    <span style={{ fontSize: 12, color: '#888' }}>
                      Dernier rappel : <strong>{REMINDER_LABELS[u.last_reminder_type]}</strong> le {u.last_reminder_date}
                    </span>
                  </div>
                )}

                {/* Actions rappels */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => sendReminder(u, 'cart_abandon')}
                    disabled={u.cart_count === 0 || sending === `${u.id}-cart_abandon`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: u.cart_count === 0 ? '#f3f4f6' : DARK,
                      color: u.cart_count === 0 ? '#ccc' : BRAND,
                      border: 'none', borderRadius: 8, padding: '9px 16px',
                      fontSize: 12, fontWeight: 600, cursor: u.cart_count === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Mail size={13} />
                    {sending === `${u.id}-cart_abandon` ? 'Envoi…' : 'Rappel panier'}
                  </button>
                  <button
                    onClick={() => sendReminder(u, 'wishlist')}
                    disabled={u.wishlist_count === 0 || sending === `${u.id}-wishlist`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: u.wishlist_count === 0 ? '#f3f4f6' : '#fff0f5',
                      color: u.wishlist_count === 0 ? '#ccc' : '#9d174d',
                      border: `1px solid ${u.wishlist_count === 0 ? '#f3f4f6' : '#fce7f3'}`,
                      borderRadius: 8, padding: '9px 16px',
                      fontSize: 12, fontWeight: 600, cursor: u.wishlist_count === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Heart size={13} />
                    {sending === `${u.id}-wishlist` ? 'Envoi…' : 'Rappel wishlist'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#ccc', fontSize: 14 }}>
            Aucun utilisateur trouvé
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
