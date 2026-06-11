import React, { useEffect, useState, useRef } from 'react'
import adminAxios from '../../utils/adminAxios'
import Swal from 'sweetalert2'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const QUILL_MODULES = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ size: ['small', false, 'large'] }],
    ['clean'],
  ],
}

const BRAND = '#fedbd1'
const DARK = '#1a1a1a'
const SERVER = 'https://backend.lipsempirebyarielle.store'

const EMPTY = { title: '', price: '', old_price: '', stock_qty: '', status: 'disponible', description: '', image: null }

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | product object
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const load = () => {
    adminAxios.get('admin/products/')
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (p) => {
    setForm({ title: p.title, price: p.price, old_price: p.old_price, stock_qty: p.stock_qty, status: p.status, description: p.description || '', image: null })
    setModal(p)
  }

  const save = async () => {
    if (!form.title || !form.price) return Swal.fire({ icon: 'warning', title: 'Titre et prix requis' })
    setSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== '') fd.append(k, v) })
    try {
      if (modal === 'create') {
        await adminAxios.post('admin/products/', fd)
        Swal.fire({ icon: 'success', title: 'Produit créé !', timer: 1500, showConfirmButton: false })
      } else {
        await adminAxios.patch(`admin/products/${modal.id}/`, fd)
        Swal.fire({ icon: 'success', title: 'Produit mis à jour !', timer: 1500, showConfirmButton: false })
      }
      setModal(null); load()
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: e.response?.data ? JSON.stringify(e.response.data) : 'Erreur serveur' })
    } finally { setSaving(false) }
  }

  const del = async (id, title) => {
    const result = await Swal.fire({
      icon: 'warning', title: `Supprimer "${title}" ?`, text: 'Cette action est irréversible.',
      showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler',
      confirmButtonColor: '#ef4444',
    })
    if (!result.isConfirmed) return
    await adminAxios.delete(`admin/products/${id}/`)
    load()
  }

  const imgSrc = (url) => url?.replace('backend.lipsempirebyarielle.store', 'lipsempirebyarielle.store')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h4 style={{ margin: 0, fontWeight: 700, color: DARK }}>Produits</h4>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>{products.length} produit(s)</p>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: DARK, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {loading ? <p style={{ color: '#aaa' }}>Chargement…</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
              <img src={imgSrc(p.image)} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} loading="lazy" decoding="async" onError={e => e.target.style.display = 'none'} />
              <div style={{ padding: '12px 14px' }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 13, color: DARK, lineHeight: 1.3 }}>{p.title}</p>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#b85c3a', fontWeight: 700 }}>{parseFloat(p.price).toFixed(2)} CAD</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: p.stock_qty === 0 ? '#ef4444' : p.stock_qty <= 5 ? '#f59e0b' : '#10b981', fontWeight: 500 }}>
                    Stock: {p.stock_qty}
                  </span>
                  <span style={{ fontSize: 11, background: BRAND, padding: '2px 8px', borderRadius: 10, color: DARK }}>{p.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(p)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: BRAND, border: 'none', borderRadius: 6, padding: '7px 0', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    <Edit2 size={13} /> Modifier
                  </button>
                  <button onClick={() => del(p.id, p.title)} style={{ width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal create/edit */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: DARK }}>{modal === 'create' ? 'Nouveau produit' : `Modifier — ${modal.title}`}</h5>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {[
              { key: 'title', label: 'Titre', type: 'text' },
              { key: 'price', label: 'Prix (CAD)', type: 'number' },
              { key: 'old_price', label: 'Ancien prix (CAD)', type: 'number' },
              { key: 'stock_qty', label: 'Stock', type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Statut</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}>
                <option value="disponible">Disponible</option>
                <option value="en_attente">En attente</option>
                <option value="rupture">Rupture</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>
                Description
                <span style={{ marginLeft: 6, color: '#bbb', fontWeight: 400 }}>— gras, italique, listes disponibles</span>
              </label>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <ReactQuill
                  theme="snow"
                  value={form.description}
                  onChange={val => setForm(f => ({ ...f, description: val }))}
                  modules={QUILL_MODULES}
                  style={{ fontSize: 13 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))}
                style={{ fontSize: 13 }} />
              {modal !== 'create' && modal.image && (
                <img src={imgSrc(modal.image)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} style={{ flex: 1, padding: '11px 0', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
              <button onClick={save} disabled={saving} style={{ flex: 1, padding: '11px 0', background: DARK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
