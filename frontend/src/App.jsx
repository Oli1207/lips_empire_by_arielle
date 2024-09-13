import { useState } from 'react'
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





function App() {
  

  return (
    <BrowserRouter>
    <MainWrapper>
    <Header />
   
     
     <Routes>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={< Login />}/>
        <Route path='/logout' element={< Logout />}/>
        <Route path="/" element={<HomeScreen />}/>
        <Route path="/detail/:slug/" element={<ProductDetailScreen />}/>
        <Route path="/cart/" element={<CartScreen />}/>
        <Route path="/checkout/:order_oid/" element={<CheckoutScreen />}/>
        <Route path="/payment-success/:order_oid/" element={<PaymentSuccessScreen/>}/>
      

      </Routes>
     
      <Footer />
      </MainWrapper>
    </BrowserRouter>
  )
}

export default App
