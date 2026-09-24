import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Breadcrumb, PageHeader } from '../components/Common'
import ProductCard from '../components/ProductCard'
import { useApi } from '../hooks/useApi'

const GROUPS = [
  { key: 'fabric', title: 'Fabric', widget: 'widget-1', idPrefix: 'cat-', column: 'fabric_id', counted: true },
  { key: 'size', title: 'Size', widget: 'widget-2', idPrefix: 'size-', column: 'size_id' },
  { key: 'tags', title: 'Tags', widget: 'widget-4', idPrefix: 'brand-', column: 'tags_id' },
]

/**
 * welcome/show-all-products.php. The sidebar filter was jquery.demano.js toggling an `.off`
 * class on `.filterable` columns. It is reimplemented here against the same markup and the
 * same `.off` rule: options within a group widen the match, separate groups narrow it.
 */
export default function ShowAllProducts() {
  const { alias } = useParams()
  const { data } = useApi(`/subcategories/${alias}/products`)
  const [selected, setSelected] = useState({})

  const subcategory = data?.subcategory
  const products = data?.products ?? []
  const filters = data?.filters ?? { fabric: [], size: [], tags: [] }
  const sideImages = data?.sideImages ?? []

  const toggle = (group, id) =>
    setSelected((current) => {
      const set = new Set(current[group] ?? [])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...current, [group]: [...set] }
    })

  const visible = (product) =>
    GROUPS.every(({ key, column }) => {
      const ids = selected[key] ?? []
      return ids.length === 0 || ids.includes(product[column])
    })

  // data-<filter_alias>="<filter_name>" on each column, as the PHP loop printed it.
  const dataAttributes = (product) => {
    const attrs = {}
    for (const { key, column } of GROUPS) {
      const f = filters[key].find((x) => x.id === product[column])
      if (f) attrs[`data-${f.filter_alias}`] = f.filter_name
    }
    return attrs
  }

  const clearAll = (event) => {
    event.preventDefault()
    setSelected({})
  }

  return (
    <>
      <style>{`.off { display: none !important; }`}</style>

      <main className="main">
        <PageHeader title={subcategory?.subcategory_name} />
        <Breadcrumb current={subcategory?.subcategory_name} className="breadcrumb-nav mb-2" />

        <div className="page-content" id="cusFilter">
          <div className="container">
            <div className="row">
              <div className="col-lg-9">
                <div className="products mb-3">
                  <div className="row justify-content-center">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className={`col-6 col-md-4 col-lg-4 col-xl-3 filterable${visible(p) ? '' : ' off'}`}
                        {...dataAttributes(p)}
                      >
                        <ProductCard product={p} image={p.image} showSku />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="col-lg-3 order-lg-first">
                <div className="sidebar sidebar-shop">
                  <div className="widget widget-clean">
                    <label>Filters:</label>
                    <a href="#" className="sidebar-filter-clear" onClick={clearAll}>Clean All</a>
                  </div>

                  {GROUPS.map(({ key, title, widget, idPrefix, column, counted }) => {
                    const options = filters[key]
                    // Tags is the only group the template omitted entirely when empty.
                    if (key === 'tags' && options.length === 0) return null
                    return (
                      <div className="widget widget-collapsible" key={key}>
                        <h3 className="widget-title">
                          <a data-toggle="collapse" href={`#${widget}`} role="button" aria-expanded="true" aria-controls={widget}>
                            {title}
                          </a>
                        </h3>

                        <div className="collapse show" id={widget}>
                          <div className="widget-body">
                            <div className={counted ? 'filter-items filter-items-count' : 'filter-items'}>
                              {options.map((f, index) => (
                                <div className="filter-item" key={f.id}>
                                  <div className="custom-control custom-checkbox">
                                    <input
                                      type="checkbox"
                                      className="custom-control-input filter"
                                      data-attribute={f.filter_alias}
                                      data-value={f.filter_name}
                                      data-group={key}
                                      id={`${idPrefix}${index + 1}`}
                                      checked={(selected[key] ?? []).includes(f.id)}
                                      onChange={() => toggle(key, f.id)}
                                    />
                                    <label className="custom-control-label" htmlFor={`${idPrefix}${index + 1}`}>{f.filter_name}</label>
                                  </div>
                                  {counted && (
                                    <span className="item-count">{products.filter((p) => p[column] === f.id).length}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {sideImages.map((img) => (
                    <div className="widget" key={img.id}>
                      <div className="widget-body">
                        <a href={img.url}>
                          <img src={`/assets/welcome/images/sideimages/${img.image}`} className="product-image" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
