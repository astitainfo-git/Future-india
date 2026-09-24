import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { imageUrl } from '../api/client'
import { useApi } from '../hooks/useApi'
import { InvoiceBody } from '../pages/ProformaInvoice'
import { decodeSymbol, formatDate } from '../utils/currency'
import { Buttons, DataTable, FormPage, ListPage, ok, fail, save, StatusSelect, useFlash } from './shared'

// ---- users: showallusers.php / addedit-users.php ----

export function Users() {
  const { data } = useApi('/admin/users')
  const { flash, setFlash } = useFlash()
  return (
    <ListPage title="Show All Users" flash={flash} setFlash={setFlash}>
      <div className="table-responsive">
        {data && (
          <DataTable version={data.length}>
            <thead>
              <tr className="text-dark">
                <th scope="col"></th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Contact</th>
                <th scope="col">City</th>
                <th scope="col">Country</th>
                <th scope="col">Currency</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{`${u.fname ?? ''} ${u.lname ?? ''}`}</td>
                  <td>{u.email}</td>
                  <td>{u.contact_no}</td>
                  <td>{u.city}</td>
                  <td>{u.country}</td>
                  <td>{u.currency}</td>
                  <td>{u.status}</td>
                  <td><Link className="btn btn-sm btn-primary" to={`/admin/edit-user/${u.id}`}><i className="fas fa-edit"></i></Link></td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ListPage>
  )
}

export function UserForm() {
  const { id } = useParams()
  const { data: u } = useApi(id ? `/admin/users/${id}` : null)
  const { flash, setFlash, go } = useFlash()
  if (id && !u) return null

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (id) await save('put', `/admin/users/${id}`, e.currentTarget)
      else await save('post', '/admin/users', e.currentTarget)
      go('/admin/show-all-users', ok(id ? 'Details Updated Successfully' : 'Details Added Successfully'))
    } catch (err) {
      go('/admin/show-all-users', fail(err))
    }
  }

  const input = (name, label, type = 'text') => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input type={type} className="form-control" id={name} name={name} defaultValue={u?.[name] ?? ''} required />
    </div>
  )

  return (
    <FormPage title={id ? 'Edit User Details' : 'Add New User'} flash={flash} setFlash={setFlash}>
      <form onSubmit={submit} key={id ?? 'new'}>
        {input('fname', 'First Name')}
        {input('lname', 'Last Name')}
        {input('email', 'Email', 'email')}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          {/* The PHP edit form pre-filled the stored password (base64, so readable). It is never
              sent to the browser now: leave blank on edit to keep the current password. */}
          <input type="password" className="form-control" id="password" name="password" required={!id} />
        </div>
        {input('contact_no', 'Contact No')}
        <div className="mb-3">
          <label htmlFor="dob" className="form-label">DOB</label>
          <input type="date" className="form-control" id="dob" name="dob" defaultValue={u?.dob ? String(u.dob).slice(0, 10) : ''} required />
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Address</label>
          <textarea className="form-control" id="address" name="address" defaultValue={u?.address ?? ''} required></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select className="form-control" id="gender" name="gender" defaultValue={u?.gender ?? 'Male'}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        {input('city', 'City')}
        {input('state', 'State')}
        {input('country', 'Country')}
        {input('pincode', 'Pincode')}
        <div className="mb-3">
          <label htmlFor="currency" className="form-label">Currency</label>
          <select className="form-control" id="currency" name="currency" defaultValue={u?.currency ?? 'inr'}>
            <option value="inr">INR</option>
            <option value="usd">USD</option>
            <option value="gbp">GBP</option>
            <option value="aud">AUD</option>
            <option value="euro">EURO</option>
          </select>
        </div>
        {id && <StatusSelect value={u.status} />}
        <Buttons label={id ? 'Update' : 'Submit'} />
      </form>
    </FormPage>
  )
}

// ---- carts: cart-details.php / client-cart-details.php ----

export function CartDetails() {
  const { data } = useApi('/admin/carts')
  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 text-primary">Show All Cart Details</h6>
        </div>
        <div className="table-responsive">
          {data && (
            <DataTable version={data.length}>
              <thead>
                <tr className="text-dark">
                  <th scope="col"></th>
                  <th scope="col">Client Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Total Qty</th>
                  <th scope="col">Currency</th>
                  <th scope="col">Created Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => (
                  <tr key={c.usr_id}>
                    <td>{i + 1}</td>
                    <td>{c.fname} {c.lname}</td>
                    <td>{c.email}</td>
                    <td>{c.total_qty}</td>
                    <td>{c.currency}</td>
                    <td>{formatDate(c.created_at)}</td>
                    <td>
                      <a className="btn btn-sm btn-dark" href={`/admin/client-cart-details/${c.usr_id}`} title="View Cart" target="_blank" rel="noreferrer">
                        <i className="fas fa-eye"></i>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>
      </div>
    </div>
  )
}

// Standalone documents (no admin layout) that loaded only the admin bootstrap.min.css.
function useStandalone(title) {
  useEffect(() => {
    const keep = ['/assets/admin/css/bootstrap.min.css', 'font-awesome', 'fonts.googleapis']
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
      (l) => !keep.some((k) => l.href.includes(k)),
    )
    links.forEach((l) => {
      l.disabled = true
    })
    const previous = document.title
    document.title = title
    return () => {
      links.forEach((l) => {
        l.disabled = false
      })
      document.title = previous
    }
  }, [title])
}

export function ClientCartDetails() {
  const { id } = useParams()
  const { data } = useApi(`/admin/carts/${id}`)
  useStandalone('Cart Details Client Wise')
  const user = data?.user

  return (
    <div className="container">
      <div className="table-responsive">
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th colSpan="6" className="text-center">
                <img src="/assets/welcome/images/futurelogo.png" alt="Future India Export" />
              </th>
            </tr>
            <tr>
              <th>Client Name:</th>
              <th>{user?.fname} {user?.lname}</th>
              <th>Email:</th>
              <th>{user?.email}</th>
              <th>Gender:</th>
              <th>{user?.gender}</th>
            </tr>
            <tr>
              <th>City:</th>
              <th>{user?.city}</th>
              <th>State:</th>
              <th>{user?.state}</th>
              <th>Country:</th>
              <th>{user?.country}</th>
            </tr>
          </tbody>
        </table>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>#</th>
              <th width="15%">Image</th>
              <th>Product</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Price</th>
            </tr>
            {(data?.items ?? []).map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td><img width="100%" src={imageUrl('products', c.pro_image)} /></td>
                <td>
                  {c.pro_name}<br />
                  <strong>SKU:</strong> {c.sku}
                </td>
                <td className="text-center">{c.qty}</td>
                <td className="text-end">{decodeSymbol(c.curr_symbol)} {c.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- orders: showallorders.php ----

const ORDER_TITLES = {
  pending: 'Show All Pending Orders',
  complete: 'Show All Complete Orders',
  cancelled: 'Show All Cancelled Orders',
}

export function Orders({ status }) {
  const { data } = useApi(`/admin/orders?status=${status}`)
  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 text-primary">{ORDER_TITLES[status]}</h6>
        </div>
        <div className="table-responsive">
          {data && (
            <DataTable version={`${status}-${data.length}`}>
              <thead>
                <tr className="text-dark">
                  <th scope="col">Inv No.</th>
                  <th scope="col">Date</th>
                  <th scope="col">Qty</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Payment Status</th>
                  <th scope="col">Order Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{formatDate(o.order_date)}</td>
                    <td>{o.total_qty}</td>
                    <td>{decodeSymbol(o.curn_symbol)} {o.total_amount}</td>
                    <td>{o.payment_status}</td>
                    <td>{o.order_status}</td>
                    <td>
                      {/* href="" in the template: the Detail screen was never built. */}
                      <a className="btn btn-sm btn-primary" href="">Detail</a>{' '}
                      <a className="btn btn-sm btn-dark" href={`/admin/print-pi-details/${o.id}`} target="_blank" rel="noreferrer"><i className="fas fa-print"></i></a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </div>
      </div>
    </div>
  )
}

// Admin::print_proforma_invoice renders welcome/proforma-invoice.php, the same document the
// customer prints, with the storefront's bootstrap.min.css.
export function AdminInvoice() {
  const { id } = useParams()
  const { data } = useApi(`/admin/orders/${id}`)

  useEffect(() => {
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')]
    links.forEach((l) => {
      l.disabled = true
    })
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = '/assets/welcome/css/bootstrap.min.css'
    document.head.appendChild(css)
    document.title = 'Proforma Invoice'
    return () => {
      css.remove()
      links.forEach((l) => {
        l.disabled = false
      })
    }
  }, [])

  return <InvoiceBody user={data?.user} items={data?.items} />
}
