import { Link } from 'react-router-dom'
import { api, imageUrl } from '../api/client'
import { Breadcrumb, PageHeader } from '../components/Common'
import { useAuth } from '../hooks/useAuth'

// welcome/wishlist.php
export default function Wishlist() {
  const { wishlist, setWishlist } = useAuth()

  const remove = async (event, id) => {
    event.preventDefault()
    const { data } = await api.delete(`/account/wishlist/${id}`)
    setWishlist(data)
  }

  return (
    <main className="main">
      <PageHeader title="Wishlist" subtitle="Shop" />
      <Breadcrumb current="Wishlist" />

      <div className="page-content">
        <div className="container">
          <table className="table table-wishlist table-mobile">
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {wishlist.map((item) => (
                <tr key={item.id}>
                  <td className="product-col">
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
                  <td className="stock-col">
                    {Number(item.qty) > 0 ? <span className="in-stock">In stock</span> : <span className="out-of-stock">Out of stock</span>}
                  </td>
                  <td className="remove-col">
                    <a href="#" className="btn-remove" onClick={(e) => remove(e, item.id)}>
                      <i className="icon-close"></i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
