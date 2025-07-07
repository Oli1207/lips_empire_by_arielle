import { useEffect, useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
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



function App() {
  const [count, setCount] = useState(0)
  const [cartCount, setCartCount] = useState()

  const cart_id = CartID()
  const userData = UserData()
  
  useEffect(() => {
    const url = userData ? `cart-list/${cart_id}/${userData?.user_id}/` : `cart-list/${cart_id}/`;
    apiInstance.get(url).then((res) => {
      setCartCount(res.data.length)
    })
    console.log(cartCount)
  })
  return (
    <CartContext.Provider value={[cartCount, setCartCount]}>
    <BrowserRouter>
    <MainWrapper>
    <Header />
   
     
     <Routes>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={< Login />}/>
        <Route path='/logout' element={< Logout />}/>
        <Route path="/" element={<HomeScreen />}/>
        <Route path="/detail/:slug/" element={<ProductDetailScreen />}/>
        <Route path="/cart" element={<CartScreen />}/>
        <Route path="/checkout/:order_oid/" element={<CheckoutScreen />}/>
        <Route path="/payment-success/:order_oid/" element={<PaymentSuccessScreen/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>
        <Route path="/policy" element={<PolicyScreen/>}/>
        <Route path="/livraison" element={<LivraisonScreen/>}/>
        <Route path="/search" element={<Search  />} />  {/* Affiche les résultats de recherche par texte */}
       
      </Routes>
     
      <Footer />
      </MainWrapper>
    </BrowserRouter>
    </CartContext.Provider>
  )
}

export default App;
