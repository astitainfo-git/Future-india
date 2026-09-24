import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage, imageUrl } from '../api/client'
import { Html } from '../components/Common'
import ProductCard from '../components/ProductCard'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { initOwl, initSpinners, useTheme } from '../theme/theme'
import { priceOf } from '../utils/currency'

const RELATED_OPTIONS = JSON.stringify({
  nav: false,
  dots: true,
  margin: 20,
  loop: false,
  responsive: {
    0: { items: 1 },
    480: { items: 2 },
    768: { items: 3 },
    992: { items: 4 },
    1200: { items: 4, nav: true, dots: false },
  },
})

// Molla's main.js sets up the zoom only on the page it first loads on, so it is repeated here
// for every product the SPA navigates to, with the options that file uses.
function initGallery($) {
  const $zoom = $('#product-zoom')
  if (!$zoom.length || !$.fn.elevateZoom) return
  $('.zoomContainer').remove()
  $zoom.removeData('elevateZoom')
  $zoom.elevateZoom({
    gallery: 'product-zoom-gallery',
    galleryActiveClass: 'active',
    zoomType: 'inner',
    cursor: 'crosshair',
    zoomWindowFadeIn: 400,
    zoomWindowFadeOut: 400,
    responsive: true,
  })

  $('.product-gallery-item').off('click.fie').on('click.fie', function select(e) {
    e.preventDefault()
    $('#product-zoom-gallery').find('a').removeClass('active')
    $(this).addClass('active')
  })

  $('#btn-product-gallery').off('click.fie').on('click.fie', (e) => {
    e.preventDefault()
    if (!$.magnificPopup) return
    const items = $('#product-zoom-gallery a')
      .map((_, a) => ({ src: $(a).attr('data-zoom-image') }))
      .get()
    $.magnificPopup.open({ items, type: 'image', gallery: { enabled: true } }, 0)
  })
}

// welcome/product-details.php
export default function ProductDetails() {
  const { alias } = useParams()
  const navigate = useNavigate()
  const { data } = useApi(`/products/${alias}`)
  const { isClient, currency, addToCart, addToWishlist } = useAuth()
  const [alert, setAlert] = useState(null)
  const root = useRef(null)

  useTheme(
    ($) => {
      initOwl(root.current)
      initGallery($)
      initSpinners(root.current)
    },
    [data],
  )

  if (!data) return <main className="main" ref={root}></main>

  const { product, images, size, fabric, tags, category, related, prev, next } = data
  const { price, symbol } = priceOf(product, currency)

  // myjs.js posted { prals, qt } to /myaccount/addtocart and wrote the JSON message into
  // #AltMsg inside the hidden .msgAlrt box.
  const submitCart = async () => {
    try {
      // Read from the DOM: the theme's input spinner updates this input outside React.
      await addToCart(product.pro_alias, root.current.querySelector('#qty')?.value || product.min_ord_qty)
      setAlert({ type: 'alert-success', message: 'Product added to cart successfully' })
    } catch (err) {
      setAlert({ type: 'alert-danger', message: errorMessage(err) || 'Product is not added to cart. Please try again.' })
    }
  }

  // Home::addtowishlist added the row and redirected to the wishlist page.
  const submitWishlist = async (event) => {
    event.preventDefault()
    await addToWishlist(product.pro_alias)
    navigate('/myaccount/wishlist')
  }

  const pagerLink = (target) => (isClient && target ? `/product/${target}` : null)
  const first = images[0]?.image

  return (
    <main className="main" ref={root}>
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container d-flex align-items-center">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.pro_name}</li>
          </ol>

          <nav className="product-pager ml-auto" aria-label="Product">
            <PagerLink to={pagerLink(prev)} className="product-pager-link product-pager-prev" label="Previous" title={isClient ? undefined : 'Work After Login'}>
              <i className="icon-angle-left"></i>
              <span>Prev</span>
            </PagerLink>

            <PagerLink to={pagerLink(next)} className="product-pager-link product-pager-next" label="Next" title={isClient ? undefined : 'Work After Login'}>
              <span>Next</span>
              <i className="icon-angle-right"></i>
            </PagerLink>
          </nav>
        </div>
      </nav>

      <div className="page-content">
        <div className="container">
          <div className="product-details-top">
            <div className="row">
              <div className="col-md-12 mt-2 mb-2">
                <div
                  style={{ display: alert ? undefined : 'none' }}
                  className={`alert alert-dismissible fade show msgAlrt ${alert?.type ?? ''}`}
                  role="alert"
                >
                  <span id="AltMsg">{alert?.message}</span>
                  <button type="button" className="close" aria-label="Close" onClick={() => setAlert(null)}>
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
              </div>
              <div className="col-md-6">
                <div className="product-gallery product-gallery-vertical">
                  <div className="row">
                    <figure className="product-main-image">
                      <img
                        id="product-zoom"
                        src={imageUrl('products', first)}
                        data-zoom-image={imageUrl('products', first)}
                        alt={product.pro_name}
                      />

                      <a href="#" id="btn-product-gallery" className="btn-product-gallery">
                        <i className="icon-arrows"></i>
                      </a>
                    </figure>

                    <div id="product-zoom-gallery" className="product-image-gallery">
                      {images.map((img, index) => (
                        <a
                          key={img.id}
                          className={`product-gallery-item ${index === 0 ? 'active' : ''}`}
                          href="#"
                          data-image={imageUrl('products', img.image)}
                          data-zoom-image={imageUrl('products', img.image)}
                        >
                          <img src={imageUrl('products', img.image)} alt="" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="product-details">
                  <h1 className="product-title">{product.pro_name}</h1>
                  <input type="hidden" id="prAlias" value={product.pro_alias} />
                  <div className="ratings-container">
                    <div className="ratings">
                      <div className="ratings-val" style={{ width: `${product.star_rating}%` }}></div>
                    </div>
                    <a className="ratings-text" href="#product-review-link" id="review-link"></a>
                  </div>

                  {isClient && (
                    <div className="product-price">
                      {symbol} {price}
                    </div>
                  )}

                  <div className="product-content">
                    <p>{product.short_description}</p>
                  </div>

                  <div className="details-filter-row details-row-size mb-0">
                    <label>SKU:</label>
                    <div className="filter-colors">{product.sku}</div>
                  </div>

                  <div className="details-filter-row details-row-size mb-0">
                    <label>Fabric:</label>
                    <div className="filter-colors">{fabric?.filter_name}</div>
                  </div>

                  {Number(product.tags_id) !== 0 && (
                    <div className="details-filter-row details-row-size mb-0">
                      <label>Tags:</label>
                      <div className="filter-colors">{tags?.filter_name}</div>
                    </div>
                  )}

                  <div className="details-filter-row details-row-size">
                    <label>Size:</label>
                    <div className="filter-colors">{size?.filter_name}</div>
                  </div>

                  {isClient ? (
                    <>
                      <div className="details-filter-row details-row-size">
                        <label htmlFor="qty">Qty:</label>
                        {/* Keyed so the theme spinner, which inserts DOM next to the input, is rebuilt per product. */}
                        <div className="product-details-quantity" key={product.id}>
                          <input
                            type="number"
                            id="qty"
                            className="form-control"
                            defaultValue={product.min_ord_qty}
                            min={product.min_ord_qty}
                            step="10"
                            required
                          />
                        </div>
                      </div>

                      <div className="product-details-action">
                        <button className="btn-product btn-cart myCart" onClick={submitCart}><span>add to cart</span></button>

                        <div className="details-action-wrapper">
                          <a href={`/myaccount/add-to-wishlist/${product.pro_alias}`} className="btn-product btn-wishlist" title="Wishlist" onClick={submitWishlist}>
                            <span>Add to Wishlist</span>
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="product-details-action">
                      <a href="#signin-modal" data-toggle="modal" className="btn-product btn-cart"><span>Login to See Price</span></a>
                    </div>
                  )}

                  <div className="product-details-footer">
                    <div className="product-cat">
                      <span>Category:</span>
                      <a href="#">{category?.category_name}</a>
                    </div>

                    <div className="social-icons social-icons-sm">
                      <span className="social-label">Share:</span>
                      <ShareThis />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="product-details-tab">
            <ul className="nav nav-pills justify-content-center" role="tablist">
              <li className="nav-item">
                <a className="nav-link active" id="product-desc-link" data-toggle="tab" href="#product-desc-tab" role="tab" aria-controls="product-desc-tab" aria-selected="true">Description</a>
              </li>
              {product.video_link && (
                <li className="nav-item">
                  <a className="nav-link" id="product-video-link" data-toggle="tab" href="#product-video-tab" role="tab" aria-controls="product-video-tab" aria-selected="false">Video</a>
                </li>
              )}
              <li className="nav-item">
                <a className="nav-link" id="product-review-link" data-toggle="tab" href="#product-review-tab" role="tab" aria-controls="product-review-tab" aria-selected="false">Reviews (2)</a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade show active" id="product-desc-tab" role="tabpanel" aria-labelledby="product-desc-link">
                <div className="product-desc-content">
                  <Html html={product.description} />
                </div>
              </div>

              {product.video_link && (
                <div className="tab-pane fade" id="product-video-tab" role="tabpanel" aria-labelledby="product-video-link">
                  <div className="product-desc-content">
                    <Html html={product.video_link} />
                  </div>
                </div>
              )}

              {/* The two reviews are hard-coded in product-details.php and are kept verbatim. */}
              <div className="tab-pane fade" id="product-review-tab" role="tabpanel" aria-labelledby="product-review-link">
                <div className="reviews">
                  <h3>Reviews (2)</h3>
                  <Review name="Samanta J." rating="80%" date="6 days ago" title="Good, perfect size" helpful={2}>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ducimus cum dolores assumenda asperiores facilis porro reprehenderit animi culpa atque blanditiis commodi perspiciatis doloremque, possimus, explicabo, autem fugit beatae quae voluptas!
                  </Review>
                  <Review name="John Doe" rating="100%" date="5 days ago" title="Very good" helpful={0}>
                    Sed, molestias, tempore? Ex dolor esse iure hic veniam laborum blanditiis laudantium iste amet. Cum non voluptate eos enim, ab cumque nam, modi, quas iure illum repellendus, blanditiis perspiciatis beatae!
                  </Review>
                </div>
              </div>
            </div>
          </div>

          <h2 className="title text-center mb-4">You May Also Like</h2>

          <div className="owl-carousel owl-simple carousel-equal-height carousel-with-shadow" data-toggle="owl" data-owl-options={RELATED_OPTIONS}>
            {related.map((r) => (
              <ProductCard key={r.pro_alias} product={r} image={r.image} showSku price={r.price} symbol={r.symbol} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

// `href="javascript:void();"` in the template when there is no neighbour or the visitor is a guest.
function PagerLink({ to, className, label, title, children }) {
  if (to) {
    return (
      <Link className={className} to={to} aria-label={label} tabIndex="-1">
        {children}
      </Link>
    )
  }
  return (
    <a className={className} href="#" title={title} aria-label={label} tabIndex="-1" onClick={(e) => e.preventDefault()}>
      {children}
    </a>
  )
}

function Review({ name, rating, date, title, helpful, children }) {
  return (
    <div className="review">
      <div className="row no-gutters">
        <div className="col-auto">
          <h4><a href="#">{name}</a></h4>
          <div className="ratings-container">
            <div className="ratings">
              <div className="ratings-val" style={{ width: rating }}></div>
            </div>
          </div>
          <span className="review-date">{date}</span>
        </div>
        <div className="col">
          <h4>{title}</h4>

          <div className="review-content">
            <p>{children}</p>
          </div>

          <div className="review-action">
            <a href="#"><i className="icon-thumbs-up"></i>Helpful ({helpful})</a>
            <a href="#"><i className="icon-thumbs-down"></i>Unhelpful (0)</a>
          </div>
        </div>
      </div>
    </div>
  )
}

// The ShareThis inline buttons the page loaded in its 'scripts' section.
const SHARETHIS = 'https://platform-api.sharethis.com/js/sharethis.js#property=68a5a3bf29e65322fc1305bb&product=inline-share-buttons'

function ShareThis() {
  useTheme(() => {
    if (window.__sharethis__) {
      window.__sharethis__.initialize?.()
      return
    }
    if (document.querySelector(`script[src="${SHARETHIS}"]`)) return
    const el = document.createElement('script')
    el.src = SHARETHIS
    el.async = true
    document.body.appendChild(el)
  }, [])
  return <div className="sharethis-inline-share-buttons"></div>
}
