import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { api, imageUrl } from '../api/client'
import { Breadcrumb, PageHeader } from '../components/Common'
import { useAuth } from '../hooks/useAuth'
import { initSpinners, useTheme } from '../theme/theme'
import { decodeSymbol } from '../utils/currency'

// welcome/cart-page.php
export default function CartPage() {
  const { cart, setCart } = useAuth()
  const root = useRef(null)

  useTheme(() => initSpinners(root.current), [cart])

  const total = cart.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0)
  // $crsyb started as &#8377; and took the last row's symbol.
  const symbol = cart.length ? decodeSymbol(cart[cart.length - 1].curr_symbol) : '₹'

  // Home::updatecart walked crtid[] and upqt[] in parallel. Values are read from the form
  // because the theme's quantity spinner edits the inputs outside React.
  const update = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const ids = form.getAll('crtid[]')
    const qtys = form.getAll('upqt[]')
    const { data } = await api.put('/account/cart', { items: ids.map((id, i) => ({ id, qty: qtys[i] })) })
    setCart(data)
  }

  const remove = async (event, id) => {
    event.preventDefault()
    const { data } = await api.delete(`/account/cart/${id}`)
    setCart(data)
  }

  return (
    <main className="main" ref={root}>
      {/* The template used a relative url() here, which resolves under /myaccount/; kept as-is. */}
      <PageHeader title="Shopping Cart" subtitle="Shop" image="assets/welcome/images/page-header-bg.jpg" />
      <Breadcrumb current="Cart" />

      <div className="page-content">
        <div className="cart">
          <div className="container">
            <div className="row">
              <div className="col-lg-9">
                <form onSubmit={update} key={cart.map((c) => `${c.id}:${c.qty}`).join(',')}>
                  <table className="table table-cart table-mobile">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td className="product-col">
                            <input type="hidden" name="crtid[]" value={item.id} />
                            <div className="product">
                              <figure className="product-media">
                                <Link to={`/product/${item.pro_alias}`}>
                                  <img src={imageUrl('products', item.pro_image)} alt="" />
                                </Link>
                              </figure>

                              <h3 className="product-title">
                                <Link to={`/product/${item.pro_alias}`}>{item.pro_name}</Link>
                              </h3>
                            </div>
                          </td>
                          <td className="price-col">{decodeSymbol(item.curr_symbol)} {item.price}</td>
                          <td className="quantity-col">
                            <div className="cart-product-quantity">
                              <input type="number" className="form-control" defaultValue={item.qty} min="1" max="10" step="1" data-decimals="0" name="upqt[]" required />
                            </div>
                          </td>
                          <td className="total-col">{Number(item.qty) * Number(item.price)}</td>
                          <td className="remove-col">
                            <a href="#" className="btn-remove" title="Remove Product" onClick={(e) => remove(e, item.id)}>
                              <i className="icon-close"></i>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="cart-bottom">
                    <div className="cart-discount">
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="coupon code" />
                        <div className="input-group-append">
                          <button className="btn btn-outline-primary-2" type="button"><i className="icon-long-arrow-right"></i></button>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-outline-dark-2">
                      <span>UPDATE CART</span><i className="icon-refresh"></i>
                    </button>
                  </div>
                </form>
              </div>
              <aside className="col-lg-3">
                <div className="summary summary-cart">
                  <h3 className="summary-title">Cart Total</h3>

                  <table className="table table-summary">
                    <tbody>
                      <tr className="summary-subtotal">
                        <td>Subtotal:</td>
                        <td>{symbol} {total}</td>
                      </tr>
                      <tr className="summary-shipping">
                        <td>Shipping:</td>
                        <td>&nbsp;</td>
                      </tr>

                      <tr className="summary-shipping-row">
                        <td>
                          <div className="custom-control custom-radio">
                            <input type="radio" id="free-shipping" name="shipping" className="custom-control-input" defaultChecked />
                            <label className="custom-control-label" htmlFor="free-shipping">Free Shipping</label>
                          </div>
                        </td>
                        <td>{symbol} 0.00</td>
                      </tr>

                      <tr className="summary-total">
                        <td>Total:</td>
                        <td>{symbol} {total}</td>
                      </tr>
                    </tbody>
                  </table>

                  <Link to="/myaccount/checkout" className="btn btn-outline-primary-2 btn-order btn-block">PROCEED TO CHECKOUT</Link>
                </div>

                <Link to="/" className="btn btn-outline-dark-2 btn-block mb-3"><span>CONTINUE SHOPPING</span><i className="icon-refresh"></i></Link>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
