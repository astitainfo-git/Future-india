import { Link } from 'react-router-dom'
import { imageUrl } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { priceOf } from '../utils/currency'

/**
 * The `product product-7 text-center` block repeated across home.php, show-all-products.php,
 * search.php and product-details.php. `showSku` reproduces the extra `.product-cat` line the
 * listing and related-product variants carry; `imageHover` the second image on the home page.
 */
export default function ProductCard({ product, image, imageHover, showSku = false, price, symbol, imageAlt = '' }) {
  const { isClient, currency } = useAuth()
  const href = `/product/${product.pro_alias}`
  const resolved = price !== undefined ? { price, symbol } : priceOf(product, currency)

  return (
    <div className="product product-7 text-center">
      <figure className="product-media">
        <Link to={href}>
          <img src={imageUrl('products', image)} alt={imageAlt} className="product-image" />
          {imageHover && <img src={imageUrl('products', imageHover)} alt="" className="product-image-hover" />}
        </Link>

        <div className="product-action-vertical">
          <Link to={href} className="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></Link>
        </div>

        <div className="product-action">
          <Link to={href} className="btn-product btn-cart"><span>add to cart</span></Link>
        </div>
      </figure>

      <div className="product-body">
        {showSku && (
          <div className="product-cat">
            <Link to={href}>{product.sku}</Link>
          </div>
        )}

        <h3 className="product-title">
          <Link to={href}>{product.pro_name}</Link>
        </h3>

        {isClient ? (
          <div className="product-price">
            {resolved.symbol} {resolved.price}
          </div>
        ) : (
          <div className="product-price mt-2">
            <a href="#signin-modal" data-toggle="modal">Login to See Price</a>
          </div>
        )}

        <div className="ratings-container">
          <div className="ratings">
            <div className="ratings-val" style={{ width: `${product.star_rating}%` }}></div>
          </div>
          <span className="ratings-text"></span>
        </div>
      </div>
    </div>
  )
}
