import React, { useEffect, useState } from 'react'
import adminAxios from '../../utils/adminAxios'
import Swal from 'sweetalert2'
import { Plus, Trash2, X } from 'lucide-react'

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'

function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ code: '', discount: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminAxios.get('admin/coupons/')
      .then(r => setCoupons(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.code || !form.discount) return Swal.fire({ icon: 'warning', title: 'Code et réduction requis' })
    setSaving(true)
    try {
      await adminAxios.post('admin/coupons/', { code: form.code.toUpperCase(), discount: parseInt(form.discount), active: true })
      Swal.fire({ icon: 'success', title: 'Coupon créé !', timer: 1500, showConfirmButton: false })
      setForm({ code: '', discount: '' }); setShowCreate(false); load()
    } catch { Swal.fire({ icon: 'error', title: 'Erreur' }) }
    finally { setSaving(false) }
  }

  const toggle = async (c) => {
    await adminAxios.patch(`admin/coupons/${c.id}/`, { active: !c.active })
    load()
  }

  const del = async (id, code) => {
    const result = await Swal.fire({
      icon: 'warning', title: `Supprimer le coupon "${code}" ?`,
      showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
    })
    if (!result.isConfirmed) return
    await adminAxios.delete(`admin/coupons/${id}/`); load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 700, color: DARK }}>Codes promo</h4>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{coupons.length} coupon(s)</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: DARK, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={16} /> Créer
        </button>
      </div>

      {loading ? <p style={{ color: '#aaa' }}>Chargement…</p> : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Code', 'Réduction', 'Statut', 'Créé le', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#888', fontWeight: 500, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, letterSpacing: 1, fontSize: 14, fontFamily: 'monospace' }}>{c.code}</td>
                  <td style={{ padding: '12px 16px', color: '#b85c3a', fontWeight: 700 }}>−{c.discount}%</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => toggle(c)}
                      style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                        background: c.active ? '#d1fae5' : '#f3f4f6',
                        color: c.active ? '#065f46' : '#9ca3af',
                      }}
                    >{c.active ? 'Actif' : 'Inactif'}</button>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#aaa', fontSize: 11 }}>{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => del(c.id, c.code)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p style={{ textAlign: 'center', padding: 30, color: '#aaa' }}>Aucun coupon</p>}
        </div>
      )}

      {/* Modal create */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: DARK }}>Nouveau code promo</h5>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Code</label>
              <input
                type="text" placeholder="EX: SUMMER20"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'monospace', textTransform: 'uppercase', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Réduction (%)</label>
              <input
                type="number" min="1" max="100" placeholder="10"
                value={form.discount}
                onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: '11px 0', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
              <button onClick={create} disabled={saving} style={{ flex: 1, padding: '11px 0', background: DARK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Création…' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCoupons
