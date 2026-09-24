import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { errorMessage, imageUrl } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { decodeSymbol } from '../utils/currency'
import { useTheme } from '../theme/theme'
import SignInModal from './SignInModal'

// welcome/layout.php. The markup, class names and ordering are the template's; only the PHP
// echoes became JSX expressions and the form posts became API calls.
export default function Layout() {
  const { site, cart, wishlist, user, setCart } = useAuth()
  const navigate = useNavigate()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMsg, setNewsletterMsg] = useState('')

  // Header, footer, mobile menu and modal mount once and stay mounted, so main.js keeps its
  // bindings across navigation.
  useTheme()

  const contact = site.contact ?? {}
  const headline = site.headline
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0)

  const search = (event) => {
    event.preventDefault()
    const term = new FormData(event.currentTarget).get('srch')
    if (String(term).trim()) navigate(`/search?srch=${encodeURIComponent(String(term).trim())}`)
  }

  const removeCartItem = async (event, id) => {
    event.preventDefault()
    const { api } = await import('../api/client')
    const { data } = await api.delete(`/account/cart/${id}`)
    setCart(data)
  }

  const subscribe = async (event) => {
    event.preventDefault()
    const { api } = await import('../api/client')
    try {
      const { data } = await api.post('/newsletter', { email: newsletterEmail })
      setNewsletterMsg(data.message)
      setNewsletterEmail('')
    } catch (err) {
      setNewsletterMsg(errorMessage(err))
    }
  }

  const subcategoriesOf = (categoryId) => site.subcategories.filter((s) => s.cat_id === categoryId)

  return (
    <>
      <div className="page-wrapper">
        <header className="header header-7">
          <div className="header-top">
            <div className="container-fluid">
              <div className="header-left">
                <div className="header-dropdown">
                  {user ? (
                    <a href="#">{user.currency}</a>
                  ) : (
                    <>
                      <a href="#">Avilable Currency</a>
                      <div className="header-menu">
                        <ul>
                          <li><a href="#">INR</a></li>
                          <li><a href="#">USD</a></li>
                          <li><a href="#">GBP</a></li>
                          <li><a href="#">AUD</a></li>
                          <li><a href="#">EURO</a></li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="header-right">
                <ul className="top-menu">
                  <li>
                    <a href="#">Links</a>
                    <ul>
                      <li>
                        <a href={`tel:+91${contact.mobile_no ?? ''}`}>
                          <i className="icon-phone"></i>Call: +91-{contact.mobile_no}
                        </a>
                      </li>
                      <li>
                        <Link to="/myaccount/wishlist">
                          <i className="icon-heart-o"></i>My Wishlist <span>({wishlist.length})</span>
                        </Link>
                      </li>
                      {user ? (
                        <li>
                          <Link to="/myaccount/dashboard"><i className="icon-user"></i>Myaccount</Link>
                        </li>
                      ) : (
                        <li>
                          <a href="#signin-modal" data-toggle="modal"><i className="icon-user"></i>Login</a>
                        </li>
                      )}
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="header-middle sticky-header">
            <div className="container-fluid">
              <div className="header-left">
                <button className="mobile-menu-toggler">
                  <span className="sr-only">Toggle mobile menu</span>
                  <i className="icon-bars"></i>
                </button>

                <Link to="/" className="logo">
                  <img src="/assets/welcome/images/futurelogo.png" alt="Future India Export" />
                </Link>

                <nav className="main-nav">
                  <ul className="menu sf-arrows">
                    <li className="megamenu-container active">
                      <Link to="/" className="sf-with-ul">Home</Link>
                    </li>
                    {site.categories.map((cat) => (
                      <li key={cat.id}>
                        <a href="#" className="sf-with-ul" onClick={(e) => e.preventDefault()}>
                          {cat.category_name}
                        </a>
                        {site.subcategories.length > 0 && (
                          <ul>
                            {subcategoriesOf(cat.id).map((sub) => (
                              <li key={sub.id}>
                                <Link to={`/products/${sub.subcategory_alias}`}>{sub.subcategory_name}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                    <li>
                      <Link to="/customization">Customization</Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="header-right">
                <div className="header-search header-search-extended header-search-visible">
                  <a href="#" className="search-toggle" role="button"><i className="icon-search"></i></a>
                  <form onSubmit={search}>
                    <div className="header-search-wrapper search-wrapper-wide">
                      <label htmlFor="q" className="sr-only">Search</label>
                      <input type="search" className="form-control" name="srch" id="q" placeholder="Search product ..." required />
                      <button className="btn btn-primary" type="submit"><i className="icon-search"></i></button>
                    </div>
                  </form>
                </div>

                <div className="dropdown cart-dropdown">
                  <a
                    href="#"
                    className="dropdown-toggle"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    data-display="static"
                  >
                    <i className="icon-shopping-cart"></i>
                    <span className="cart-count">{cart.length}</span>
                  </a>

                  {cart.length > 0 && (
                    <div className="dropdown-menu dropdown-menu-right">
                      <div className="dropdown-cart-products">
                        {cart.map((item) => (
                          <div className="product" key={item.id}>
                            <div className="product-cart-details">
                              <h4 className="product-title">
                                <Link to={`/product/${item.pro_alias}`}>{item.pro_name}</Link>
                              </h4>

                              <span className="cart-product-info">
                                <span className="cart-product-qty">{item.qty}</span>
                                {' x '}{decodeSymbol(item.curr_symbol)} {item.price}
                              </span>
                            </div>

                            <figure className="product-image-container">
                              <Link to={`/product/${item.pro_alias}`} className="product-image">
                                <img style={{ height: '60px' }} src={imageUrl('products', item.pro_image)} alt="" />
                              </Link>
                            </figure>
                            <a
                              href="#"
                              className="btn-remove"
                              title="Remove Product"
                              onClick={(e) => removeCartItem(e, item.id)}
                            >
                              <i className="icon-close"></i>
                            </a>
                          </div>
                        ))}
                      </div>

                      <div className="dropdown-cart-total">
                        <span>Total</span>

                        <span className="cart-total-price">
                          {decodeSymbol(cart[0].curr_symbol)} {cartTotal}
                        </span>
                      </div>

                      <div className="dropdown-cart-action">
                        <Link to="/myaccount/cart" className="btn btn-primary">View Cart</Link>
                        <Link to="/myaccount/checkout" className="btn btn-outline-primary-2">
                          <span>Checkout</span><i className="icon-long-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {headline && (
          <section className="mb-2">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="notify-bar" role="status" aria-live="polite">
                    <div className="notify-track" dangerouslySetInnerHTML={{ __html: headline.content }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <Outlet />

        <footer className="footer footer-2">
          <div className="footer-middle">
            <div className="container-fluid">
              <div className="row">
                <div className="col-sm-12 col-lg-4">
                  <div className="widget widget-about">
                    <img src="/assets/welcome/images/futurelogo.png" className="footer-logo" alt="Future India Export" />
                    <p>{contact.home_aboutus}</p>

                    <div className="widget-about-info">
                      <div className="row">
                        <div className="col-sm-12">
                          <span className="widget-about-title">Got Question? Call us 24/7</span>
                          <a href={`tel:+91${contact.mobile_no ?? ''}`}>+91-{contact.mobile_no}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-4 col-lg-2">
                  <div className="widget">
                    <h4 className="widget-title">Useful links</h4>

                    <ul className="widget-list">
                      <li><Link to="/about-us">About Us</Link></li>
                      <li><Link to="/contact-us">Contact us</Link></li>
                      <li><Link to="/login">Log in</Link></li>
                      <li><Link to="/terms-conditions">Terms &amp; Condition</Link></li>
                      <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                      <li><Link to="/return-policy">Return Policy</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="col-sm-4 col-lg-2">
                  <div className="widget">
                    <h4 className="widget-title">My Account</h4>

                    <ul className="widget-list">
                      <li><Link to="/registration">Sign Up</Link></li>
                      <li><Link to="/myaccount/cart">View Cart</Link></li>
                      <li><Link to="/myaccount/wishlist">My Wishlist</Link></li>
                      <li><Link to="/myaccount/dashboard">Track My Order</Link></li>
                      <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="widget widget-newsletter">
                    <h4 className="widget-title">Newsletter</h4>
                    <p>Subscribe now to get our latest news and exclusive offers!</p>
                    {newsletterMsg && <p className="text-white">{newsletterMsg}</p>}
                    <form onSubmit={subscribe}>
                      <div className="input-group">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your Email Address"
                          name="email"
                          aria-label="Email Adress"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          required
                        />
                        <div className="input-group-append">
                          <button className="btn btn-dark" type="submit"><i className="icon-long-arrow-right"></i></button>
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="social-icons social-icons-color">
                    <span className="social-label">Social Media</span>
                    <a href={contact.facebook} className="social-icon social-facebook" title="Facebook" target="_blank" rel="noreferrer"><i className="icon-facebook-f"></i></a>
                    <a href={contact.instagram} className="social-icon social-instagram" title="Instagram" target="_blank" rel="noreferrer"><i className="icon-instagram"></i></a>
                    <a href={contact.youtube} className="social-icon social-youtube" title="Youtube" target="_blank" rel="noreferrer"><i className="icon-youtube"></i></a>
                    <a href={contact.pinterest} className="social-icon social-pinterest" title="Pinterest" target="_blank" rel="noreferrer"><i className="icon-pinterest"></i></a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="container-fluid">
              <p className="footer-copyright">Copyright © 2025 Future India Export Store. All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <button id="scroll-top" title="Back to Top"><i className="icon-arrow-up"></i></button>

      {/* Mobile Menu */}
      <div className="mobile-menu-overlay"></div>

      <div className="mobile-menu-container">
        <div className="mobile-menu-wrapper">
          <span className="mobile-menu-close"><i className="icon-close"></i></span>

          <form onSubmit={search} className="mobile-search">
            <label htmlFor="mobile-search" className="sr-only">Search</label>
            <input type="search" className="form-control" name="srch" id="mobile-search" placeholder="Search in..." required />
            <button className="btn btn-primary" type="submit"><i className="icon-search"></i></button>
          </form>

          <nav className="mobile-nav">
            <ul className="mobile-menu">
              <li className="active">
                <Link to="/">Home</Link>
              </li>

              {site.categories.map((cat) => (
                <li key={cat.id}>
                  <a href="#" onClick={(e) => e.preventDefault()}>{cat.category_name}</a>
                  {site.subcategories.length > 0 && (
                    <ul>
                      {subcategoriesOf(cat.id).map((sub) => (
                        <li key={sub.id}>
                          <Link to={`/products/${sub.subcategory_alias}`}>{sub.subcategory_name}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="social-icons">
            <a href={contact.facebook} className="social-icon" target="_blank" rel="noreferrer" title="Facebook"><i className="icon-facebook-f"></i></a>
            <a href={contact.pinterest} className="social-icon" target="_blank" rel="noreferrer" title="Pinterest"><i className="icon-pinterest"></i></a>
            <a href={contact.instagram} className="social-icon" target="_blank" rel="noreferrer" title="Instagram"><i className="icon-instagram"></i></a>
            <a href={contact.youtube} className="social-icon" target="_blank" rel="noreferrer" title="Youtube"><i className="icon-youtube"></i></a>
          </div>
        </div>
      </div>

      <SignInModal />
    </>
  )
}
