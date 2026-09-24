import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { imageUrl } from '../api/client'
import { useApi } from '../hooks/useApi'
import { decodeSymbol } from '../utils/currency'

// proforma-invoice.php was a standalone document that loaded only bootstrap.min.css. The
// storefront's other stylesheets are switched off while it is shown so it renders the same.
function useBootstrapOnly() {
  useEffect(() => {
    const disabled = [...document.querySelectorAll('link[rel="stylesheet"]')].filter(
      (link) => !link.href.endsWith('/assets/welcome/css/bootstrap.min.css'),
    )
    disabled.forEach((link) => {
      link.disabled = true
    })
    const title = document.title
    document.title = 'Proforma Invoice'
    return () => {
      disabled.forEach((link) => {
        link.disabled = false
      })
      document.title = title
    }
  }, [])
}

// The invoice body, shared by /myaccount/print-pi-details/:id and the admin copy.
export function InvoiceBody({ user, items }) {
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
              <th>Address:</th>
              <th colSpan="5">{user?.address}</th>
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
              <th className="text-right">Price</th>
            </tr>

            {(items ?? []).map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td><img width="100%" src={imageUrl('products', item.proimage)} /></td>
                <td>
                  {item.pro_name}<br />
                  <strong>SKU:</strong> {item.sku}
                </td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{decodeSymbol(item.cur_symbol)} {item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// welcome/proforma-invoice.php via Home::print_proforma_invoice
export default function ProformaInvoice() {
  const { id } = useParams()
  const { data: order } = useApi(`/account/orders/${id}`)
  const { data: user } = useApi('/account/profile')
  useBootstrapOnly()

  return <InvoiceBody user={user} items={order?.items} />
}
