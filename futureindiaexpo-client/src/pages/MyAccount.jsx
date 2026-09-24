import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import { Breadcrumb, Feedback, PageHeader } from '../components/Common'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { jq } from '../theme/theme'
import { formatDate } from '../utils/currency'

// The address form shared by checkout.php and the Account Details tab of myaccount.php.
export function AddressFields({ user }) {
  return (
    <>
      <div className="row">
        <div className="col-sm-6">
          <label>First Name *</label>
          <input type="text" className="form-control" name="fname" defaultValue={user.fname ?? ''} required />
        </div>
        <div className="col-sm-6">
          <label>Last Name *</label>
          <input type="text" className="form-control" name="lname" defaultValue={user.lname ?? ''} required />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
          <label>Gender *</label>
          {/* The template never pre-selected this, so saving reset every user to Male. */}
          <select className="form-control" name="gender" defaultValue={user.gender || 'Male'} required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="col-sm-6">
          <label>DOB *</label>
          <input type="date" className="form-control" name="dob" defaultValue={user.dob ? String(user.dob).slice(0, 10) : ''} required />
        </div>
      </div>

      <label>Country *</label>
      <input type="text" className="form-control" name="country" defaultValue={user.country ?? ''} required />

      <label>Street address *</label>
      <textarea className="form-control" name="address" placeholder="Your Delivery Address" defaultValue={user.address ?? ''} required></textarea>

      <div className="row">
        <div className="col-sm-6">
          <label>Town / City *</label>
          <input type="text" className="form-control" name="city" defaultValue={user.city ?? ''} required />
        </div>

        <div className="col-sm-6">
          <label>State *</label>
          <input type="text" className="form-control" name="state" defaultValue={user.state ?? ''} required />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
          <label>Postcode / ZIP *</label>
          <input type="text" className="form-control" name="pincode" defaultValue={user.pincode ?? ''} required />
        </div>

        <div className="col-sm-6">
          <label>Contact No *</label>
          <input type="tel" className="form-control" name="contact_no" defaultValue={user.contact_no ?? ''} required />
        </div>
      </div>

      <label>Email address *</label>
      <input type="email" className="form-control" value={user.email ?? ''} disabled readOnly />
    </>
  )
}

export function AddressTable({ user, bordered = true }) {
  return (
    <table className={bordered ? 'table table-bordered urdltbl' : 'table urdltbl'}>
      <tbody>
        <tr>
          <th>First Name:</th>
          <td>{user.fname}</td>
          <th>Last Name:</th>
          <td>{user.lname}</td>
        </tr>
        <tr>
          <th>Gender</th>
          <td>{user.gender}</td>
          <th>DOB</th>
          <td>{formatDate(user.dob)}</td>
        </tr>
        <tr>
          <th>City</th>
          <td>{user.city}</td>
          <th>State</th>
          <td>{user.state}</td>
        </tr>
        <tr>
          <th>Country</th>
          <td>{user.country}</td>
          <th>Pincode/Zip</th>
          <td>{user.pincode}</td>
        </tr>
        <tr>
          <th>Address</th>
          <td colSpan="3">{user.address}</td>
        </tr>
      </tbody>
    </table>
  )
}

// main.js wired .tab-trigger-link to open the tab its href names.
function openTab(event) {
  event.preventDefault()
  const target = event.currentTarget.getAttribute('href')
  jq()?.(`${target}-link`).tab('show')
}

// Flashdata was printed inside the Dashboard pane, which is the active tab after PHP's
// redirect()->back(); showing the Dashboard tab reproduces that.
const showDashboard = () => jq()?.('#tab-dashboard-link').tab('show')

// welcome/myaccount.php
export default function MyAccount() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { data: user, reload } = useApi('/account/profile')
  const { data: orders } = useApi('/account/orders')
  const [feedback, setFeedback] = useState(null)

  const signOut = (event) => {
    event.preventDefault()
    logout()
    // Home::logout redirected to /login.
    navigate('/login')
  }

  const submit = (path) => async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    try {
      const { data } = await api.put(path, Object.fromEntries(new FormData(form)))
      setFeedback({ type: 'alert-success', message: data.message })
      if (path === '/account/password') form.reset()
      else await reload()
    } catch (err) {
      setFeedback({ type: 'alert-danger', message: errorMessage(err) })
    }
    showDashboard()
  }

  const orderRows = orders ?? []

  return (
    <>
      <style>{`
        .urdltbl th,
        .urdltbl td {
          padding: 5px 8px;
        }
      `}</style>

      <main className="main">
        {/* Relative path in the template (it does not resolve); kept as-is so the header matches. */}
        <PageHeader title="My Account" subtitle="Shop" image="assets/images/page-header-bg.jpg" />
        <Breadcrumb current="My Account" className="breadcrumb-nav mb-3" />

        <div className="page-content">
          <div className="dashboard">
            <div className="container">
              <div className="row">
                <aside className="col-md-4 col-lg-3">
                  <ul className="nav nav-dashboard flex-column mb-3 mb-md-0" role="tablist">
                    <li className="nav-item">
                      <a className="nav-link active" id="tab-dashboard-link" data-toggle="tab" href="#tab-dashboard" role="tab" aria-controls="tab-dashboard" aria-selected="true">Dashboard</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" id="tab-orders-link" data-toggle="tab" href="#tab-orders" role="tab" aria-controls="tab-orders" aria-selected="false">Orders</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" id="tab-address-link" data-toggle="tab" href="#tab-address" role="tab" aria-controls="tab-address" aria-selected="false">Adresses</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" id="tab-account-link" data-toggle="tab" href="#tab-account" role="tab" aria-controls="tab-account" aria-selected="false">Account Details</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" id="tab-downloads-link" data-toggle="tab" href="#tab-downloads" role="tab" aria-controls="tab-downloads" aria-selected="false">Change Password</a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/myaccount/logout" onClick={signOut}>Sign Out</a>
                    </li>
                  </ul>
                </aside>

                <div className="col-md-8 col-lg-9">
                  <div className="tab-content">
                    <div className="tab-pane fade show active" id="tab-dashboard" role="tabpanel" aria-labelledby="tab-dashboard-link">
                      <Feedback feedback={feedback} onClose={() => setFeedback(null)} />

                      <p>
                        Hello <span className="font-weight-normal text-dark">User</span> (not <span className="font-weight-normal text-dark">User</span>? <a href="/myaccount/logout" onClick={signOut}>Log out</a>)
                        <br />
                        From your account dashboard you can view your{' '}
                        <a href="#tab-orders" className="tab-trigger-link link-underline" onClick={openTab}>recent orders</a>,
                        manage your <a href="#tab-address" className="tab-trigger-link" onClick={openTab}>address</a>,
                        and <a href="#tab-account" className="tab-trigger-link" onClick={openTab}>edit your password and account details</a>.
                      </p>
                    </div>

                    <div className="tab-pane fade" id="tab-orders" role="tabpanel" aria-labelledby="tab-orders-link">
                      <table className="table table-bordered urdltbl">
                        <tbody>
                          {orderRows.length > 0 ? (
                            <>
                              <tr>
                                <th>Inovice No</th>
                                <th>Order Date</th>
                                <th>Total Qty</th>
                                <th>Order Status</th>
                                <th>Print</th>
                              </tr>
                              {orderRows.map((order) => (
                                <tr key={order.id}>
                                  <td>#{order.id}</td>
                                  <td>{formatDate(order.order_date)}</td>
                                  <td>{order.total_qty}</td>
                                  <td>{order.order_status}</td>
                                  <td>
                                    <Link to={`/myaccount/print-pi-details/${order.id}`} target="_blank"><i className="fas fa-print"></i></Link>
                                  </td>
                                </tr>
                              ))}
                            </>
                          ) : (
                            <tr>
                              <th className="text-center" colSpan="4">No order has been made yet.</th>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="tab-pane fade" id="tab-address" role="tabpanel" aria-labelledby="tab-address-link">
                      <p>The following addresses will be used on the checkout page by default.</p>

                      <div className="row">
                        <div className="col-lg-12">
                          <div className="card card-dashboard">
                            <div className="card-body">
                              <h3 className="card-title mb-2">Billing Address</h3>

                              {user && <AddressTable user={user} />}
                              <a href="#tab-account" className="tab-trigger-link" onClick={openTab}>Edit <i className="icon-edit"></i></a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="tab-pane fade" id="tab-account" role="tabpanel" aria-labelledby="tab-account-link">
                      {user && (
                        <form onSubmit={submit('/account/profile')} key={user.updated_at}>
                          <AddressFields user={user} />

                          <button type="submit" className="btn btn-outline-primary-2">
                            <span>SAVE CHANGES</span>
                            <i className="icon-long-arrow-right"></i>
                          </button>
                        </form>
                      )}
                    </div>

                    <div className="tab-pane fade" id="tab-downloads" role="tabpanel" aria-labelledby="tab-downloads-link">
                      <form onSubmit={submit('/account/password')}>
                        <label>Current password *</label>
                        <input type="password" name="curr_password" className="form-control" required />

                        <label>New password *</label>
                        <input type="password" name="new_password" minLength="8" className="form-control" required />

                        <label>Confirm password *</label>
                        <input type="password" name="cfm_password" minLength="8" className="form-control mb-2" required />

                        <button type="submit" className="btn btn-outline-primary-2">
                          <span>CHANGE PASSWORD</span>
                          <i className="icon-long-arrow-right"></i>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
