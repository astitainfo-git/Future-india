import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import RequireClient from './components/RequireClient'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import Contact from './pages/Contact'
import ContentPage from './pages/ContentPage'
import Faq from './pages/Faq'
import GetCurrency from './pages/GetCurrency'
import Home from './pages/home/Home'
import Login from './pages/Login'
import MyAccount from './pages/MyAccount'
import NotFound from './pages/NotFound'
import PolicyPage from './pages/PolicyPage'
import ProductDetails from './pages/ProductDetails'
import ProformaInvoice from './pages/ProformaInvoice'
import Registration from './pages/Registration'
import Search from './pages/Search'
import ShowAllProducts from './pages/ShowAllProducts'
import ShowSubcategories from './pages/ShowSubcategories'
import ThanksPage from './pages/ThanksPage'
import Wishlist from './pages/Wishlist'

// A full page load always started at the top; client-side navigation should too.
function ScrollToTop() {
  const { pathname, search } = useLocation()
  // Braces matter: current Chrome returns a Promise from scrollTo, which React would treat as a cleanup.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

// Storefront routes from app/Config/Routes.php, at the same URLs.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* print-pi-details was a standalone document without the site layout. */}
        <Route element={<RequireClient />}>
          <Route path="/myaccount/print-pi-details/:id" element={<ProformaInvoice />} />
        </Route>

        {/* The home page is its own design with its own header and footer. */}
        <Route path="/" element={<Home />} />

        <Route element={<Layout />}>
          <Route path="/about-us" element={<ContentPage slug="about" title="About Us" />} />
          <Route path="/customization" element={<ContentPage slug="customization" title="Customization" />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/privacy-policy" element={<PolicyPage />} />
          <Route path="/terms-conditions" element={<PolicyPage />} />
          <Route path="/return-policy" element={<PolicyPage />} />
          <Route path="/products/:alias" element={<ShowAllProducts />} />
          <Route path="/product/:alias" element={<ProductDetails />} />
          <Route path="/category/:alias" element={<ShowSubcategories />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/complete-info/select-currency" element={<GetCurrency />} />

          <Route path="/myaccount" element={<RequireClient />}>
            <Route path="dashboard" element={<MyAccount />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="thanks-page" element={<ThanksPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
