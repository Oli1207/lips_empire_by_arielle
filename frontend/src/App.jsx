import { useEffect, useState } from 'react'
import { Routes, Route, BrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { SITE } from './utils/seo'
import Header from './components/Header'
import Register from './components/Register'
import Login from './components/Login'
import Footer from './components/Footer'
import HomeScreen from './screens/HomeScreen'
import Sidebar from './components/Sidebar'
import 'bootstrap/dist/css/bootstrap.min.css'
import './bootstrap.min.css'
import Cart from './components/Cart'
import Logout from './components/Logout'
import ProductDetailScreen from './screens/ProductDetailScreen'
import MainWrapper from './layout/MainWrapper'
import CartScreen from './screens/CartScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import PaymentSuccessScreen from './screens/PaymentSuccessScreen'
import Wishlist from './screens/Wishlist'
import LivraisonScreen from './screens/LivraisonScreen'
import PolicyScreen from './screens/PolicyScreen'
import Search from './components/Search'
import { CartContext } from './plugin/Context'
import CartID from './plugin/CartID'
import UserData from './plugin/UserData'
import apiInstance from './utils/axios'
import { initTracking, trackEvent } from './utils/tracking'

// Admin
import AdminRoute from './layout/AdminRoute'
import AdminLayout from './layout/AdminLayout'
import AdminDashboard from './screens/admin/AdminDashboard'
import AdminOrders from './screens/admin/AdminOrders'
import AdminProducts from './screens/admin/AdminProducts'
import AdminCoupons from './screens/admin/AdminCoupons'
import AdminReviews from './screens/admin/AdminReviews'
import AdminAnalytics from './screens/admin/AdminAnalytics'
import AdminUsers from './screens/admin/AdminUsers'

// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function TrackPageViews() {
  const location = useLocation()
  useEffect(() => {
    trackEvent('page_view', { page: location.pathname })
  }, [location.pathname])
  return null
}

function AppContent() {
  const [cartCount, setCartCount] = useState()
  const cart_id = CartID()
  const userData = UserData()

  useEffect(() => {
    initTracking()
  }, [])

  useEffect(() => {
    const url = userData ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`
    apiInstance.get(url).then(res => setCartCount(res.data.length))
  })

  const isAdminRoute = window.location.pathname.startsWith('/admin-panel')

  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
      <ScrollToTop />
      <TrackPageViews />
      {!isAdminRoute && <Header />}

      <Routes>
        {/* Routes publiques */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/" element={<HomeScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/detail/:slug/" element={<ProductDetailScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/checkout/:order_oid/" element={<CheckoutScreen />} />
        <Route path="/payment-success/:order_oid/" element={<PaymentSuccessScreen />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/policy" element={<PolicyScreen />} />
        <Route path="/livraison" element={<LivraisonScreen />} />
        <Route path="/search" element={<Search />} />

        {/* Routes Admin */}
        <Route path="/admin-panel/*" element={
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
        } />
      </Routes>

      {!isAdminRoute && <Footer />}
    </CartContext.Provider>
  )
}

const orgSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo_arielle_img.jpg`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'contact@lipsempirebyarielle.store',
    availableLanguage: ['French', 'English'],
  },
})

const websiteSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE.url}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <script type="application/ld+json">{orgSchema}</script>
        <script type="application/ld+json">{websiteSchema}</script>
      </Helmet>
      <BrowserRouter>
        <MainWrapper>
          <AppContent />
        </MainWrapper>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App
