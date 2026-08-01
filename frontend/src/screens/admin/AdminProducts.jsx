import React, { useEffect, useState, useRef } from 'react'
import adminAxios from '../../utils/adminAxios'
import Swal from 'sweetalert2'
import { Plus, Edit2, Trash2, X, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
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

const EMPTY = { title: '', price: '', old_price: '', stock_qty: '', status: 'disponible', description: '', image: null }

// ── Gallery section (only for existing products) ──────────────────────────────
function GallerySection({ productId }) {
  const [items, setItems] = useState([])
  const fileRef = useRef()
  const [uploading, setUploading] = useState(false)

  const load = () => {
    adminAxios.get(`admin/products/${productId}/gallery/`).then(r => setItems(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [productId])

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    try {
      await adminAxios.post(`admin/products/${productId}/gallery/`, fd)
      load()
    } catch {
      Swal.fire({ icon: 'error', title: 'Erreur upload' })
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const del = async (id) => {
    const ok = await Swal.fire({ icon: 'warning', title: 'Supprimer cette image ?', showCancelButton: true, confirmButtonText: 'Oui', cancelButtonText: 'Non', confirmButtonColor: '#ef4444' })
    if (!ok.isConfirmed) return
    await adminAxios.delete(`admin/products/${productId}/gallery/`, { data: { gallery_id: id } })
    setItems(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8, fontWeight: 600 }}>
        Galerie ({items.length} image{items.length !== 1 ? 's' : ''})
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {items.map(g => (
          <div key={g.id} style={{ position: 'relative', width: 80, height: 80 }}>
            <img src={g.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
            <button
              onClick={() => del(g.id)}
              style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
            >
              <X size={11} color="#fff" />
            </button>
          </div>
        ))}
        <label style={{ width: 80, height: 80, border: '2px dashed #e5e7eb', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa', fontSize: 11, gap: 4 }}>
          <input ref={fileRef} type="file" accept="image/*" onChange={upload} style={{ display: 'none' }} />
          {uploading ? '…' : <><ImageIcon size={18} /><span>Ajouter</span></>}
        </label>
      </div>
    </div>
  )
}

// ── Specifications section ────────────────────────────────────────────────────
function SpecsSection({ productId }) {
  const [specs, setSpecs] = useState([])
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    adminAxios.get(`admin/products/${productId}/specifications/`).then(r => setSpecs(r.data)).catch(() => {})
  }

  useEffect(() => { load() }, [productId])

  const add = async () => {
    if (!newTitle.trim()) return
    setSaving(true)
    try {
      const r = await adminAxios.post(`admin/products/${productId}/specifications/`, { title: newTitle, content: newContent })
      setSpecs(prev => [...prev, r.data])
      setNewTitle(''); setNewContent(''); setAdding(false)
    } catch {
      Swal.fire({ icon: 'error', title: 'Erreur' })
    } finally { setSaving(false) }
  }

  const del = async (id) => {
    await adminAxios.delete(`admin/products/${productId}/specifications/`, { data: { spec_id: id } })
    setSpecs(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 8, fontWeight: 600 }}>
        Spécifications ({specs.length})
      </label>
      {specs.map(s => (
        <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ flex: 1, background: '#f9fafb', borderRadius: 6, padding: '7px 10px', fontSize: 12 }}>
            <strong>{s.title}</strong>
            {s.content && <p style={{ margin: '4px 0 0', color: '#666', whiteSpace: 'pre-wrap' }}>{s.content}</p>}
          </div>
          <button onClick={() => del(s.id)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', flexShrink: 0 }}>
            <Trash2 size={13} color="#ef4444" />
          </button>
        </div>
      ))}
      {adding ? (
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: 12, marginTop: 8 }}>
          <input
            placeholder="Titre (ex: Ingrédients)"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }}
          />
          <textarea
            placeholder="Contenu (optionnel)"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: '7px 0', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
            <button onClick={add} disabled={saving} style={{ flex: 1, padding: '7px 0', background: DARK, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              {saving ? '…' : 'Ajouter'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: '#555', marginTop: 4 }}>
          <Plus size={13} /> Ajouter une spec
        </button>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | product object
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showExtras, setShowExtras] = useState(false)
  const fileRef = useRef()

  const load = () => {
    adminAxios.get('admin/products/')
      .then(r => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setShowExtras(false); setModal('create') }
  const openEdit = (p) => {
    setForm({ title: p.title, price: p.price, old_price: p.old_price || '', stock_qty: p.stock_qty, status: p.status, description: p.description || '', image: null })
    setShowExtras(false)
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
        Swal.fire({ icon: 'success', title: 'Produit créé !', text: 'Ouvre le produit en modification pour ajouter les images galerie et spécifications.', timer: 3000, showConfirmButton: false })
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

  const isEditing = modal !== null && modal !== 'create'

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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px 16px 40px', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, padding: 28, marginTop: 16 }}>
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
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
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
              <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Image principale</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files[0] }))}
                style={{ fontSize: 13 }} />
              {isEditing && modal.image && (
                <img src={imgSrc(modal.image)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />
              )}
            </div>

            {/* Gallery & Specs — uniquement en mode édition */}
            {isEditing && (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginBottom: 16 }}>
                <button
                  onClick={() => setShowExtras(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: DARK, cursor: 'pointer', marginBottom: showExtras ? 16 : 0 }}
                >
                  {showExtras ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Galerie & Spécifications
                </button>
                {showExtras && (
                  <>
                    <GallerySection productId={modal.id} />
                    <SpecsSection productId={modal.id} />
                  </>
                )}
              </div>
            )}

            {modal === 'create' && (
              <p style={{ fontSize: 11, color: '#aaa', marginBottom: 16, background: '#fef9f0', padding: '8px 12px', borderRadius: 6 }}>
                Après création, ouvrez le produit en modification pour ajouter les images galerie et les spécifications.
              </p>
            )}

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
