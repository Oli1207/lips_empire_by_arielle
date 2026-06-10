import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import apiInstance from '../utils/axios'
import CartID from '../plugin/CartID'
import UserData from '../plugin/UserData'

const SERVER = 'https://backend.lipsempirebyarielle.store'

function CartSlideIn() {
  const [visible, setVisible] = useState(false)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const timerRef = useRef(null)
  const cart_id = CartID()
  const userData = UserData()

  const fetchCart = async () => {
    try {
      const url = userData
        ? `cart-list/${cart_id}/${userData.user_id}/`
        : `cart-list/${cart_id}/`
      const res = await apiInstance.get(url)
      setItems(res.data.slice(0, 3))
      setTotal(res.data.reduce((s, i) => s + parseFloat(i.sub_total || 0), 0))
    } catch {}
  }

  useEffect(() => {
    const handler = () => {
      fetchCart()
      setVisible(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setVisible(false), 4500)
    }
    window.addEventListener('cart-item-added', handler)
    return () => window.removeEventListener('cart-item-added', handler)
  }, [cart_id, userData])

  const close = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  const imgSrc = (raw) => {
    if (!raw) return null
    if (raw.startsWith('http')) return raw.replace('backend.lipsempirebyarielle.store', 'lipsempirebyarielle.store')
    return `${SERVER}/media/${raw}`
  }

  return (
    <>
      <style>{`
        .cart-slidein {
          position: fixed;
          top: 70px;
          right: 0;
          width: 320px;
          max-width: 92vw;
          background: #fff;
          border-radius: 16px 0 0 16px;
          box-shadow: -4px 4px 24px rgba(0,0,0,0.13);
          z-index: 9999;
          transform: translateX(110%);
          transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }
        .cart-slidein.open {
          transform: translateX(0);
        }
      `}</style>

      <div className={`cart-slidein${visible ? ' open' : ''}`}>
        {/* Header */}
        <div style={{
          background: '#fedbd1', padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
            ✓ Ajouté au panier
          </span>
          <button onClick={close} style={{
            background: 'none', border: 'none', fontSize: 18,
            cursor: 'pointer', color: '#1a1a1a', lineHeight: 1, padding: 0,
          }}>×</button>
        </div>

        {/* Items */}
        <div style={{ padding: '12px 16px', maxHeight: 220, overflowY: 'auto' }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'center',
              paddingBottom: 10, marginBottom: 10,
              borderBottom: i < items.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              {imgSrc(item.product?.image) && (
                <img
                  src={imgSrc(item.product?.image)}
                  alt=""
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                  onError={e => e.target.style.display = 'none'}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#1a1a1a',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {item.product?.title}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: '#888' }}>
                  {item.qty} × {item.price} CAD
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px 16px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Sous-total</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
              {total.toFixed(2)} CAD
            </span>
          </div>
          <Link
            to="/cart"
            onClick={close}
            style={{
              display: 'block', textAlign: 'center',
              background: '#1a1a1a', color: '#fedbd1',
              padding: '11px 0', borderRadius: 10,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            Voir mon panier →
          </Link>
        </div>
      </div>
    </>
  )
}

export default CartSlideIn
