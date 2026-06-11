import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import apiInstance from '../utils/axios'
import SEO from '../components/SEO'

const STARS = [1, 2, 3, 4, 5]

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4, margin: '6px 0' }}>
      {STARS.map(s => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 28, color: s <= (hovered || value) ? '#f59e0b' : '#e5e7eb',
            padding: 0, lineHeight: 1,
          }}
        >★</button>
      ))}
    </div>
  )
}

function PhotoPicker({ photos, setPhotos }) {
  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    setPhotos(prev => {
      const combined = [...prev, ...files]
      return combined.slice(0, 5)
    })
  }
  const remove = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i))

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {photos.map((f, i) => (
          <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
            <img
              src={URL.createObjectURL(f)}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              style={{
                position: 'absolute', top: -6, right: -6,
                background: '#1a1a1a', color: '#fff',
                border: 'none', borderRadius: '50%',
                width: 18, height: 18, fontSize: 11,
                cursor: 'pointer', lineHeight: '18px', padding: 0, textAlign: 'center',
              }}
            >x</button>
          </div>
        ))}
        {photos.length < 5 && (
          <label style={{
            width: 72, height: 72, borderRadius: 8,
            border: '2px dashed #fedbd1', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#ccc', fontSize: 24,
          }}>
            +
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
          </label>
        )}
      </div>
      <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
        Jusqu'a 5 photos — aidez les autres clientes a voir le rendu
      </p>
    </div>
  )
}

function ReviewCard({ product, token, orderOid, name, email, onDone }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) { alert('Veuillez choisir une note.'); return }
    if (!text.trim()) { alert('Veuillez ecrire un commentaire.'); return }
    setLoading(true)
    const fd = new FormData()
    fd.append('reviewer_name', name)
    fd.append('reviewer_email', email)
    fd.append('review', text)
    fd.append('rating', rating)
    fd.append('is_global', 'false')
    fd.append('product_id', product.id)
    if (token) { fd.append('token', token); fd.append('order_oid', orderOid) }
    photos.forEach(p => fd.append('photos', p))
    await apiInstance.post('reviews/submit/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setLoading(false)
    setDone(true)
    onDone()
  }

  if (done) return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      <p style={{ margin: 0, color: '#065f46', fontWeight: 600 }}>Avis envoye pour {product.title}</p>
    </div>
  )

  return (
    <form onSubmit={submit} style={{
      background: '#fff', border: '1px solid #f0f0f0',
      borderRadius: 14, padding: '20px 22px', marginBottom: 16,
    }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
        {product.image && (
          <img src={product.image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
        )}
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{product.title}</p>
      </div>

      <label style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>Note *</label>
      <StarPicker value={rating} onChange={setRating} />

      <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginTop: 12, marginBottom: 4 }}>
        Votre avis *
      </label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Partagez votre experience avec ce produit..."
        rows={3}
        style={{
          width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
          padding: '10px 12px', fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
        }}
      />

      <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginTop: 12 }}>
        Photos (optionnel)
      </label>
      <PhotoPicker photos={photos} setPhotos={setPhotos} />

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: 16, background: '#1a1a1a', color: '#fedbd1',
          border: 'none', borderRadius: 10, padding: '12px 28px',
          fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%',
        }}
      >
        {loading ? 'Envoi...' : 'Envoyer mon avis'}
      </button>
    </form>
  )
}

function GlobalReviewForm({ token, orderOid, name: defaultName, email: defaultEmail }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  const [name, setName] = useState(defaultName || '')
  const [email, setEmail] = useState(defaultEmail || '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!rating || !text.trim() || !name.trim() || !email.trim()) {
      alert('Tous les champs marques * sont requis.'); return
    }
    setLoading(true)
    const fd = new FormData()
    fd.append('reviewer_name', name)
    fd.append('reviewer_email', email)
    fd.append('review', text)
    fd.append('rating', rating)
    fd.append('is_global', 'true')
    if (token) { fd.append('token', token); fd.append('order_oid', orderOid) }
    photos.forEach(p => fd.append('photos', p))
    await apiInstance.post('reviews/submit/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
      <p style={{ margin: 0, color: '#065f46', fontWeight: 600 }}>Merci pour votre avis !</p>
    </div>
  )

  return (
    <form onSubmit={submit} style={{
      background: '#fff8f6', border: '1px solid #fedbd1',
      borderRadius: 14, padding: '20px 22px', marginBottom: 16,
    }}>
      <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
        Avis sur votre experience
      </p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888', lineHeight: 1.6 }}>
        Laissez un avis general sur votre experience avec Lip's Empire by Arielle.
        Il sera publie apres validation par notre equipe.
      </p>

      {!defaultName && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Prenom *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Marie"
                style={{ display: 'block', width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', marginTop: 4 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Email *</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@email.com" type="email"
                style={{ display: 'block', width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', marginTop: 4 }} />
            </div>
          </div>
        </>
      )}

      <label style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>Note *</label>
      <StarPicker value={rating} onChange={setRating} />

      <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginTop: 12, marginBottom: 4 }}>
        Votre avis *
      </label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Partagez votre experience avec la marque, la qualite, la livraison..."
        rows={3}
        style={{
          width: '100%', border: '1px solid #e5e7eb', borderRadius: 8,
          padding: '10px 12px', fontSize: 14, resize: 'vertical', boxSizing: 'border-box',
        }}
      />

      <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginTop: 12 }}>
        Photos (optionnel)
      </label>
      <PhotoPicker photos={photos} setPhotos={setPhotos} />

      <button type="submit" disabled={loading} style={{
        marginTop: 16, background: '#c44569', color: '#fff',
        border: 'none', borderRadius: 10, padding: '12px 28px',
        fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%',
      }}>
        {loading ? 'Envoi...' : 'Publier mon avis'}
      </button>
    </form>
  )
}

export default function ReviewPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const orderOid = params.get('order')

  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('open')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [doneCount, setDoneCount] = useState(0)

  useEffect(() => {
    if (token && orderOid) {
      apiInstance.get(`reviews/token-info/?token=${token}&order=${orderOid}`)
        .then(r => {
          setInfo(r.data)
          setName(r.data.name || '')
          setEmail(r.data.email || '')
          setMode('verified')
        })
        .catch(() => setMode('open'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
      setMode('open')
    }
  }, [token, orderOid])

  if (loading) return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#aaa' }}>Chargement...</p>
    </main>
  )

  const products = info?.products || []

  return (
    <main style={{ marginTop: 80, marginBottom: 60 }}>
      <SEO title="Laisser un avis" noindex={true} />
      <div className="container" style={{ maxWidth: 660 }}>

        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
            {mode === 'verified' ? 'Comment etait votre commande ?' : 'Laisser un avis'}
          </h2>
          {mode === 'verified' && (
            <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
              Bonjour {name.split(' ')[0]} — votre avis aidera d'autres clientes a choisir.
            </p>
          )}
          {mode === 'open' && (
            <p style={{ color: '#888', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              Vous avez achete un produit en boutique ou en ligne ? Partagez votre experience.<br />
              Tous les avis sont verifies par notre equipe avant publication.
            </p>
          )}
        </div>

        {info?.already_reviewed && (
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: 14 }}>
              Vous avez deja laisse un avis pour cette commande. Merci !
            </p>
          </div>
        )}

        {/* Mode open : champs nom/email d'abord */}
        {mode === 'open' && (
          <div style={{
            background: '#fff', border: '1px solid #f0f0f0',
            borderRadius: 14, padding: '20px 22px', marginBottom: 20,
          }}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
              Vos informations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Prenom *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Marie"
                  style={{ display: 'block', width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Email *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="marie@email.com"
                  style={{ display: 'block', width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', marginTop: 4 }} />
              </div>
            </div>
          </div>
        )}

        {/* Avis par produit (mode verified uniquement) */}
        {mode === 'verified' && products.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 12 }}>
              Notez chaque produit
            </p>
            <p style={{ fontSize: 12, color: '#aaa', marginBottom: 16, marginTop: -8 }}>
              Vous pouvez noter chaque produit individuellement, globalement, ou les deux — c'est vous qui choisissez.
            </p>
            {products.map(p => (
              <ReviewCard
                key={p.id}
                product={p}
                token={token}
                orderOid={orderOid}
                name={name}
                email={email}
                onDone={() => setDoneCount(c => c + 1)}
              />
            ))}
          </div>
        )}

        {/* Mode open : noter un produit du catalogue */}
        {mode === 'open' && name && email && (
          <div style={{ marginBottom: 24 }}>
            <OpenProductReview name={name} email={email} />
          </div>
        )}

        {/* Avis general — toujours disponible */}
        <div style={{ marginTop: 8 }}>
          {mode === 'verified' && (
            <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', marginBottom: 12 }}>
              Vous pouvez aussi laisser un avis sur votre experience generale avec la marque
            </p>
          )}
          <GlobalReviewForm
            token={token}
            orderOid={orderOid}
            name={mode === 'verified' ? name : ''}
            email={mode === 'verified' ? email : ''}
          />
        </div>

      </div>
    </main>
  )
}

function OpenProductReview({ name, email }) {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    apiInstance.get('products/').then(r => setProducts(r.data))
  }, [])

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const submit = async (e) => {
    e.preventDefault()
    if (!selected || !rating || !text.trim()) {
      alert('Choisissez un produit, une note et ecrivez un commentaire.'); return
    }
    setLoading(true)
    const fd = new FormData()
    fd.append('reviewer_name', name)
    fd.append('reviewer_email', email)
    fd.append('review', text)
    fd.append('rating', rating)
    fd.append('is_global', 'false')
    fd.append('product_id', selected.id)
    photos.forEach(p => fd.append('photos', p))
    await apiInstance.post('reviews/submit/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '16px 20px' }}>
      <p style={{ margin: 0, color: '#065f46', fontWeight: 600 }}>Merci ! Votre avis a ete envoye.</p>
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '20px 22px' }}>
      <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
        Choisissez le produit a noter
      </p>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher un produit..."
        style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box', marginBottom: 10 }}
      />
      <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setSelected(p)}
            style={{
              padding: '10px 14px', cursor: 'pointer', fontSize: 14,
              background: selected?.id === p.id ? '#fff8f6' : '#fff',
              borderBottom: '1px solid #f9f9f9',
              color: selected?.id === p.id ? '#c44569' : '#333',
              fontWeight: selected?.id === p.id ? 700 : 400,
            }}
          >
            {p.title}
          </div>
        ))}
      </div>

      {selected && (
        <form onSubmit={submit} style={{ marginTop: 16 }}>
          <label style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>Note *</label>
          <StarPicker value={rating} onChange={setRating} />
          <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginTop: 10, marginBottom: 4 }}>
            Votre avis *
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Votre experience avec ${selected.title}...`}
            rows={3}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
          />
          <label style={{ fontSize: 13, color: '#555', fontWeight: 600, display: 'block', marginTop: 10 }}>Photos</label>
          <PhotoPicker photos={photos} setPhotos={setPhotos} />
          <button type="submit" disabled={loading} style={{
            marginTop: 14, background: '#1a1a1a', color: '#fedbd1',
            border: 'none', borderRadius: 10, padding: '12px 28px',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%',
          }}>
            {loading ? 'Envoi...' : 'Envoyer mon avis'}
          </button>
        </form>
      )}
    </div>
  )
}
