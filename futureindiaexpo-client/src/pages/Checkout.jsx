import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import { Breadcrumb, PageHeader } from '../components/Common'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { decodeSymbol } from '../utils/currency'
import { AddressFields, AddressTable } from './MyAccount'

// welcome/checkout.php
export default function Checkout() {
  const { cart, refresh } = useAuth()
  const { data: user } = useApi('/account/profile')
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const total = cart.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0)
  const symbol = decodeSymbol(cart[0]?.curr_symbol)
  // The address form shows only while the profile has neither state nor country.
  const needsAddress = user && !user.state && !user.country

  // Home::order_placed: saves any posted address fields to the user, creates the order from the
  // cart, clears the cart and redirects to the thanks page.
  const placeOrder = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await api.post('/account/orders', Object.fromEntries(new FormData(event.currentTarget)))
      await refresh()
      navigate('/myaccount/thanks-page')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
      <style>{`
        .urdltbl th,
        .urdltbl td {
          padding-top: 2px;
          padding-bottom: 2px;
        }
      `}</style>

      <main className="main">
        <PageHeader title="Checkout" subtitle="Shop" />
        <Breadcrumb current="Checkout" />

        <div className="page-content">
          <div className="checkout">
            <div className="container">
              {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}
              <form onSubmit={placeOrder}>
                <div className="row">
                  <div className="col-lg-9">
                    <h2 className="checkout-title">Billing Details</h2>
                    {user && (needsAddress ? <AddressFields user={user} /> : <AddressTable user={user} bordered={false} />)}

                    <label>Order notes (optional)</label>
                    <textarea className="form-control" cols="30" rows="4" name="special_note" placeholder="Notes about your order, e.g. special notes for delivery"></textarea>
                  </div>
                  <aside className="col-lg-3">
                    <div className="summary">
                      <h3 className="summary-title">Your Order</h3>

                      <table className="table table-summary">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {cart.map((item) => (
                            <tr key={item.id}>
                              <td><Link to={`/product/${item.pro_alias}`}>{item.pro_name}</Link></td>
                              {/* The template printed the unit price in the "Total" column; kept as-is. */}
                              <td>{decodeSymbol(item.curr_symbol)} {item.price}</td>
                            </tr>
                          ))}

                          <tr className="summary-subtotal">
                            <td>Subtotal:</td>
                            <td>{symbol} {total}</td>
                          </tr>
                          <tr>
                            <td>Shipping:</td>
                            <td>Free shipping</td>
                          </tr>
                          <tr className="summary-total">
                            <td>Total:</td>
                            <td>{symbol} {total}</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="accordion-summary" id="accordion-payment">
                        <div className="card">
                          <div className="card-header" id="heading-1">
                            <h2 className="card-title">
                              <a role="button" data-toggle="collapse" href="#collapse-1" aria-expanded="true" aria-controls="collapse-1">
                                Direct bank transfer
                              </a>
                            </h2>
                          </div>
                          <div id="collapse-1" className="collapse show" aria-labelledby="heading-1" data-parent="#accordion-payment">
                            <div className="card-body">
                              Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.
                            </div>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-outline-primary-2 btn-order btn-block">
                        <span className="btn-text">Place Order</span>
                        <span className="btn-hover-text">Proceed to Checkout</span>
                      </button>
                    </div>
                  </aside>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
