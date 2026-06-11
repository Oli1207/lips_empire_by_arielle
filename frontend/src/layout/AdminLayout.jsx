import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Tag,
  Star, BarChart2, LogOut, Menu, X, Users, MessageSquare,
} from 'lucide-react'

const NAV = [
  { path: '/admin-panel',              icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin-panel/orders',       icon: ShoppingBag,     label: 'Commandes' },
  { path: '/admin-panel/products',     icon: Package,         label: 'Produits' },
  { path: '/admin-panel/coupons',      icon: Tag,             label: 'Coupons' },
  { path: '/admin-panel/reviews',      icon: Star,            label: 'Avis clients' },
  { path: '/admin-panel/feedbacks',    icon: MessageSquare,   label: 'Retours prives' },
  { path: '/admin-panel/users',        icon: Users,           label: 'Utilisateurs' },
  { path: '/admin-panel/analytics',    icon: BarChart2,       label: 'Analytics' },
]

function AdminLayout({ children }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const isActive = (path) =>
    path === '/admin-panel'
      ? location.pathname === '/admin-panel'
      : location.pathname.startsWith(path)

  const Sidebar = () => (
    <aside style={{
      width: 220, background: '#1a1a1a', color: '#fff',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1100,
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #2d2d2d' }}>
        <p style={{ margin: 0, fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Espace admin</p>
        <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#fedbd1' }}>Lips Empire</p>
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 18px',
              color: isActive(path) ? '#fedbd1' : '#aaa',
              background: isActive(path) ? '#2a2a2a' : 'transparent',
              borderLeft: isActive(path) ? '3px solid #fedbd1' : '3px solid transparent',
              textDecoration: 'none', fontSize: 14,
              transition: 'all 0.15s',
            }}
          >
            <Icon size={17} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #2d2d2d' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#666', fontSize: 13, textDecoration: 'none' }}>
          <LogOut size={15} /> Retour au site
        </Link>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f4f6' }}>
      <style>{`
        .admin-main-content { margin-left: 0; }
        @media (min-width: 992px) { .admin-main-content { margin-left: 220px; } }
      `}</style>
      {/* Desktop sidebar */}
      <div className="d-none d-lg-block"><Sidebar /></div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1099 }}>
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <Sidebar />
        </div>
      )}

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 0 }} className="admin-main-content">
        {/* Mobile topbar */}
        <div className="d-lg-none" style={{
          background: '#1a1a1a', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#fedbd1', fontWeight: 600, fontSize: 15 }}>Lips Empire — Admin</span>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <div style={{ padding: '28px 24px', maxWidth: 1200 }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
