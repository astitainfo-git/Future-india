import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Buttons, CkTextarea, confirmDialog, DataTable, fail, FormPage, ListPage, ok, save, StatusSelect, useFlash } from './shared'

const AddNew = ({ to }) => (
  <Link to={to} className="btn btn-sm btn-success"><i className="fas fa-plus"></i> Add New</Link>
)

function SeoFields({ row = {} }) {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="meta_tag" className="form-label">Meta Tag</label>
        <input type="text" className="form-control" id="meta_tag" name="meta_tag" defaultValue={row.meta_tag} required />
      </div>
      <div className="mb-3">
        <label htmlFor="meta_keywords" className="form-label">Meta Keywords</label>
        <textarea className="form-control" id="meta_keywords" name="meta_keywords" defaultValue={row.meta_keywords} required></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="meta_description" className="form-label">Meta Description</label>
        <textarea className="form-control" id="meta_description" name="meta_description" defaultValue={row.meta_description} required></textarea>
      </div>
    </>
  )
}

// Store.php's add/update handlers all redirected to the list with one of these messages.
function useSubmit(path, id, listUrl) {
  const { go } = useFlash()
  return async (e) => {
    e.preventDefault()
    try {
      if (id) await save('put', `${path}/${id}`, e.currentTarget)
      else await save('post', path, e.currentTarget)
      go(listUrl, ok(id ? 'Details Updated Successfully' : 'Details Added Successfully'))
    } catch (err) {
      go(listUrl, fail(err))
    }
  }
}

// ---- categories: show-categories.php / addedit-category.php ----

export function Categories() {
  const { data } = useApi('/admin/categories')
  const { flash, setFlash } = useFlash()
  return (
    <ListPage title="Show All Categories" action={<AddNew to="/admin/add-category" />} flash={flash} setFlash={setFlash}>
      <div className="table-responsive">
        {data && (
          <DataTable version={data.length}>
            <thead>
              <tr className="text-dark">
                <th scope="col"></th>
                <th scope="col">Id</th>
                <th scope="col">Name</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>{c.id}</td>
                  <td>{c.category_name}</td>
                  <td>{c.status}</td>
                  <td><Link className="btn btn-sm btn-primary" to={`/admin/edit-category/${c.id}`}><i className="fas fa-edit"></i></Link></td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ListPage>
  )
}

export function CategoryForm() {
  const { id } = useParams()
  const { data: row } = useApi(id ? `/admin/categories/${id}` : null)
  const { flash, setFlash } = useFlash()
  const submit = useSubmit('/admin/categories', id, '/admin/show-categories')
  if (id && !row) return null

  return (
    <FormPage title={id ? 'Edit Category' : 'Add New Category'} flash={flash} setFlash={setFlash}>
      <form onSubmit={submit} encType="multipart/form-data" key={id ?? 'new'}>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image</label><br />
          {id && (
            <>
              <img className="img-fluid" src={`/assets/welcome/images/category/${row.image}`} width="40%" />
              <br /><br />
            </>
          )}
          <input type="file" className="form-control" id="image" name="image" required={!id} />
        </div>
        <div className="mb-3">
          <label htmlFor="category_name" className="form-label">Name</label>
          <input type="text" className="form-control" id="category_name" defaultValue={row?.category_name} name="category_name" required />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <CkTextarea id="description" name="description" defaultValue={row?.description} required />
        </div>
        {id && <StatusSelect value={row.status} />}
        <SeoFields row={row ?? {}} />
        <Buttons label={id ? 'Update' : 'Submit'} />
      </form>
    </FormPage>
  )
}

// ---- sub-categories: show-subcategories.php / addedit-subcategory.php ----

export function Subcategories() {
  const { data } = useApi('/admin/subcategories')
  const { flash, setFlash } = useFlash()
  return (
    <ListPage title="Show All Sub Categories" action={<AddNew to="/admin/add-sub-category" />} flash={flash} setFlash={setFlash}>
      <div className="table-responsive">
        {data && (
          <DataTable version={data.length}>
            <thead>
              <tr className="text-dark">
                <th scope="col"></th>
                <th scope="col">Id</th>
                <th scope="col">Name</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td>{s.id}</td>
                  <td>{s.subcategory_name}</td>
                  <td>{s.category_name}</td>
                  <td>{s.status}</td>
                  <td><Link className="btn btn-sm btn-primary" to={`/admin/edit-sub-category/${s.id}`}><i className="fas fa-edit"></i></Link></td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ListPage>
  )
}

export function SubcategoryForm() {
  const { id } = useParams()
  const { data: row } = useApi(id ? `/admin/subcategories/${id}` : null)
  const { data: categories } = useApi('/admin/categories')
  const { flash, setFlash } = useFlash()
  const submit = useSubmit('/admin/subcategories', id, '/admin/show-sub-categories')
  if ((id && !row) || !categories) return null

  return (
    <FormPage title={id ? 'Edit Sub-Category' : 'Add New Sub-Category'} flash={flash} setFlash={setFlash}>
      <form onSubmit={submit} encType="multipart/form-data" key={id ?? 'new'}>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image</label><br />
          {id && (
            <>
              <img className="img-fluid" src={`/assets/welcome/images/subcategory/${row.image}`} width="40%" />
              <br /><br />
            </>
          )}
          <input type="file" className="form-control" id="image" name="image" required={!id} />
        </div>
        <div className="mb-3">
          <label htmlFor="cat_id" className="form-label">Category</label>
          <select className="form-control" id="cat_id" name="cat_id" defaultValue={row?.cat_id ?? ''} required>
            {!id && <option value="">-- Select --</option>}
            {categories.map((c) => (
              <option value={c.id} key={c.id}>{c.category_name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="subcategory_name" className="form-label">Sub-Category Name</label>
          <input type="text" className="form-control" id="subcategory_name" defaultValue={row?.subcategory_name} name="subcategory_name" required />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <CkTextarea id="description" name="description" defaultValue={row?.description} required />
        </div>
        {id && <StatusSelect value={row.status} />}
        <SeoFields row={row ?? {}} />
        <Buttons label={id ? 'Update' : 'Submit'} />
      </form>
    </FormPage>
  )
}

// ---- filters: show-filters.php (list + add/edit form on one page) ----

const FILTERS = {
  color: { title: 'Show All Colors', list: '/admin/show-colors', edit: 'edit-color' },
  size: { title: 'Show All Sizes', list: '/admin/show-sizes', edit: 'edit-size' },
  fabric: { title: 'Show All Fabric', list: '/admin/show-fabrics', edit: 'edit-fabric' },
  tags: { title: 'Show All Tags', list: '/admin/show-tags', edit: 'edit-tags' },
}

export function Filters({ type }) {
  const { id } = useParams()
  const { title, list, edit } = FILTERS[type]
  const { data, reload } = useApi(`/admin/filters?type=${type}`)
  const { flash, setFlash, go } = useFlash()
  const editing = id ? (data ?? []).find((f) => String(f.id) === id) : null

  // Store::store_filter_details / update_filter_details returned to the filter's list page.
  const submit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    try {
      if (id) await save('put', `/admin/filters/${id}`, form)
      else await save('post', '/admin/filters', form)
      form.reset()
      await reload()
      go(list, ok(id ? 'Details Updated Successfully' : 'Details Added Successfully'))
    } catch (err) {
      go(list, fail(err))
    }
  }

  return (
    <ListPage title={title} centered={false} flash={flash} setFlash={setFlash}>
      <div>
        {(!id || editing) && (
          <form onSubmit={submit} key={`${type}-${id ?? 'new'}`}>
            <div className="mb-3">
              <label htmlFor="filter_name" className="form-label">Name</label>
              <input type="text" className="form-control" id="filter_name" defaultValue={editing?.filter_name} name="filter_name" required />
              <input type="hidden" name="filter_type" value={type} />
            </div>
            {type === 'color' && (
              <div className="mb-3">
                <label htmlFor="color_code" className="form-label">Color Code</label>
                <input type="color" className="form-control" id="color_code" defaultValue={editing?.color_code} name="color_code" required />
              </div>
            )}
            <Buttons />
          </form>
        )}
        <br />
        <br />
      </div>
      <div className="table-responsive">
        {data && (
          <DataTable version={`${type}-${data.length}`}>
            <thead>
              <tr className="text-dark">
                <th scope="col"></th>
                <th scope="col">Id</th>
                <th scope="col">Name</th>
                {type === 'color' && <th scope="col">Color Code</th>}
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((f, i) => (
                <tr key={f.id}>
                  <td>{i + 1}</td>
                  <td>{f.id}</td>
                  <td>{f.filter_name}</td>
                  {type === 'color' && <td>{f.color_code}</td>}
                  <td><Link className="btn btn-sm btn-primary" to={`/admin/${edit}/${f.id}`}><i className="fas fa-edit"></i></Link></td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ListPage>
  )
}

// ---- products: showallproducts.php / add-product.php / edit-product.php ----

export function Products() {
  const { data } = useApi('/admin/products')
  const { flash, setFlash } = useFlash()
  return (
    <ListPage title="Show All Products" flash={flash} setFlash={setFlash}>
      <div className="table-responsive">
        {data && (
          <DataTable version={data.length}>
            <thead>
              <tr className="text-dark">
                <th scope="col"></th>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col">Qty</th>
                <th scope="col">INR</th>
                <th scope="col">USD</th>
                <th scope="col">GBP</th>
                <th scope="col">AUD</th>
                <th scope="col">EURO</th>
                <th scope="col">Category</th>
                <th scope="col">Sub-Category</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.id}>
                  <td>{i + 1}</td>
                  <td>{p.pro_name}</td>
                  <td>{p.sku}</td>
                  <td>{p.qty}</td>
                  <td>{p.inr_price}</td>
                  <td>{p.usd_price}</td>
                  <td>{p.gbp_price}</td>
                  <td>{p.aud_price}</td>
                  <td>{p.euro_price}</td>
                  <td>{p.category_name}</td>
                  <td>{p.subcategory_name}</td>
                  <td>{p.status}</td>
                  <td>
                    <Link className="btn btn-sm btn-primary" to={`/admin/edit-product/${p.id}`} title="Edit Product"><i className="fas fa-edit"></i></Link>{' '}
                    <Link className="btn btn-sm btn-dark" to={`/admin/edit-product-images/${p.id}`} title="Edit Images"><i className="fas fa-images"></i></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ListPage>
  )
}

const NUMBER_FIELDS = [
  ['qty', 'Qty'],
  ['min_ord_qty', 'Minimum Order Qty'],
  ['inr_price', 'INR Price'],
  ['usd_price', 'USD Price'],
  ['gbp_price', 'GBP Price'],
  ['aud_price', 'AUD Price'],
  ['euro_price', 'EURO Price'],
]

function Select({ name, id = name, label, value, required = true, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <select className="form-control" name={name} id={id} defaultValue={value} required={required}>
        {children}
      </select>
    </div>
  )
}

const YesNo = ({ name, label, value }) => (
  <Select name={name} label={label} value={value ?? 'No'}>
    <option value="No">No</option>
    <option value="Yes">Yes</option>
  </Select>
)

export function ProductForm() {
  const { id } = useParams()
  const { data: p } = useApi(id ? `/admin/products/${id}` : null)
  const { data: categories } = useApi('/admin/categories')
  const { data: subcategories } = useApi('/admin/subcategories')
  const { data: filters } = useApi('/admin/filters')
  const { flash, setFlash } = useFlash()
  const submit = useSubmit('/admin/products', id, '/admin/show-all-products')
  if ((id && !p) || !categories || !subcategories || !filters) return null

  const ofType = (type) => filters.filter((f) => f.filter_type === type)
  const options = (rows, label) => rows.map((r) => <option value={r.id} key={r.id}>{r[label]}</option>)
  const select = !id ? <option value="">-- Select --</option> : null

  return (
    <form onSubmit={submit} key={id ?? 'new'}>
      <div className="container-fluid pt-4 px-4">
        <div className="row g-4">
          <div className="col-sm-12 col-xl-8">
            <div className="bg-light rounded h-100 p-4">
              <h6 className="mb-4 text-primary">{id ? 'Edit Product' : 'Add New Product'}</h6>
              {flash?.message && (
                <div className={`alert ${flash.type} alert-dismissible fade show`} role="alert">
                  {flash.message}
                  <button type="button" className="btn-close" aria-label="Close" onClick={() => setFlash(null)}></button>
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="pro_name" className="form-label">Product Name</label>
                <input type="text" className="form-control" id="pro_name" name="pro_name" defaultValue={p?.pro_name} required />
              </div>
              <div className="mb-3">
                <label htmlFor="sku" className="form-label">SKU</label>
                <input type="text" className="form-control" id="sku" name="sku" defaultValue={p?.sku} required />
              </div>
              {NUMBER_FIELDS.map(([name, label]) => (
                <div className="mb-3" key={name}>
                  {/* edit-product.php spelled this label "Mimimum"; kept per page. */}
                  <label htmlFor={name} className="form-label">{id && name === 'min_ord_qty' ? 'Mimimum Order Qty' : label}</label>
                  <input type="number" min="0" step="any" className="form-control" id={name} name={name} defaultValue={p?.[name]} required />
                </div>
              ))}
              <div className="mb-3">
                <label htmlFor="video_link" className="form-label">Youtube Video Link</label>
                <textarea className="form-control" id="video_link" name="video_link" defaultValue={p?.video_link}></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="short_description" className="form-label">Short Description</label>
                <CkTextarea id="short_description" name="short_description" defaultValue={p?.short_description} required />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <CkTextarea id="description" name="description" defaultValue={p?.description} required />
              </div>
              <SeoFields row={p ?? {}} />
              <Buttons label="Submit" />
            </div>
          </div>
          <div className="col-sm-12 col-xl-4">
            <div className="bg-light rounded h-100 p-4">
              <h6 className="mb-4 text-primary">Other Details</h6>
              <Select name="cat_id" id="category" label="Category" value={p?.cat_id ?? ''}>
                {select}
                {options(categories, 'category_name')}
              </Select>
              <Select name="subcat_id" id="subcategory" label="Sub-Category" value={p?.subcat_id ?? ''}>
                {select}
                {options(subcategories, 'subcategory_name')}
              </Select>
              <Select name="color_id" label="Color" value={p?.color_id ?? '0'} required={false}>
                <option value="0">{id ? 'None' : '-- Select --'}</option>
                {options(ofType('color'), 'filter_name')}
              </Select>
              <Select name="size_id" label="Size" value={p?.size_id ?? ''}>
                {select}
                {options(ofType('size'), 'filter_name')}
              </Select>
              <Select name="fabric_id" label="Fabric" value={p?.fabric_id ?? ''}>
                {select}
                {options(ofType('fabric'), 'filter_name')}
              </Select>
              <Select name="tags_id" label="Tags" value={p?.tags_id ?? ''}>
                {select}
                <option value="0">None</option>
                {options(ofType('tags'), 'filter_name')}
              </Select>
              <Select name="gender" label="Gender" value={p?.gender ?? ''}>
                {select}
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
              <Select name="star_rating" label="Star Rating" value={p?.star_rating != null ? String(p.star_rating) : ''}>
                {select}
                <option value="20">1</option>
                <option value="40">2</option>
                <option value="60">3</option>
                <option value="80">4</option>
                <option value="100">5</option>
              </Select>
              <YesNo name="feature_pros" label="Feature Products" value={p?.feature_pros} />
              <YesNo name="new_arrivals" label="New Arrivals" value={p?.new_arrivals} />
              <YesNo name="best_sellers" label="Best Sellers" value={p?.best_sellers} />
              <YesNo name="show_without_login" label="Show Without Login" value={p?.show_without_login} />
              {id && <StatusSelect value={p.status} />}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

// admin/product-images.php
export function ProductImages() {
  const { id } = useParams()
  const { data: product } = useApi(`/admin/products/${id}`)
  const { data: images, reload } = useApi(`/admin/products/${id}/images`)
  const { flash, setFlash } = useFlash()

  const saveOrder = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const ids = form.getAll('ids[]')
    const orders = form.getAll('orderno[]')
    try {
      await api.put(`/admin/products/${id}/images/order`, { items: ids.map((imageId, i) => ({ id: imageId, order_no: orders[i] })) })
      setFlash(ok('Details Updated Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  const remove = async (e, imageId) => {
    e.preventDefault()
    if (!confirmDialog()) return
    try {
      const { data } = await api.delete(`/admin/product-images/${imageId}`)
      setFlash(ok(data.message))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  const upload = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const files = form.elements.image.files
    const data = new FormData()
    for (const file of files) data.append('images', file)
    try {
      await api.post(`/admin/products/${id}/images`, data)
      form.reset()
      setFlash(ok('Details Updated Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  return (
    <FormPage title="Edit & Upload Product Images" flash={flash} setFlash={setFlash}>
      {images?.length > 0 && (
        <form onSubmit={saveOrder} key={images.map((i) => `${i.id}:${i.order_no}`).join(',')}>
          <div className="text-end mb-3">
            <button type="submit" className="btn btn-sm btn-success">Save Order</button>
          </div>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Image</th>
                <th width="10%">Order No</th>
                <th>Action</th>
              </tr>
              {images.map((img) => (
                <tr key={img.id}>
                  <td>
                    <img className="img-fluid" width="20%" src={`/assets/welcome/images/products/${img.image}`} />
                  </td>
                  <td>
                    <input type="number" min="0" className="form-control" name="orderno[]" defaultValue={img.order_no} />
                    <input type="hidden" name="ids[]" value={img.id} />
                  </td>
                  <td>
                    <a href={`/admin/delete-product-image/${img.id}`} className="btn btn-sm btn-danger" onClick={(e) => remove(e, img.id)}>
                      <i className="fas fa-trash-alt"></i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      )}
      <form onSubmit={upload} encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image</label>
          <input type="file" className="form-control" id="image" name="image" multiple required />
        </div>
        <div className="mb-3">
          <label>Product Name</label>
          <input className="form-control" value={product?.pro_name ?? ''} disabled readOnly />
        </div>
        <div className="mb-3">
          <label>SKU</label>
          <input className="form-control" value={product?.sku ?? ''} disabled readOnly />
        </div>
        <Buttons />
      </form>
    </FormPage>
  )
}

// ---- side images: showallsideimages.php / addedit-sideimages.php ----

export function SideImages() {
  const { data, reload } = useApi('/admin/side-images')
  const { flash, setFlash } = useFlash()

  const remove = async (e, imageId) => {
    e.preventDefault()
    if (!confirmDialog()) return
    try {
      await api.delete(`/admin/side-images/${imageId}`)
      setFlash(ok('Image Delete Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  return (
    <ListPage title="Show All Side Images" flash={flash} setFlash={setFlash}>
      <div className="row mb-3">
        <div className="col-lg-12 text-end">
          <Link to="/admin/add-side-image" className="btn btn-success">Add New</Link>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table text-start align-middle table-bordered table-hover mb-0">
          <thead>
            <tr className="text-dark">
              <th scope="col">#</th>
              <th scope="col">Title</th>
              <th scope="col">Subcategory</th>
              <th scope="col">Order No</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.title}</td>
                <td>{s.subcategory_name}</td>
                <td>{s.order_no}</td>
                <td>{s.status}</td>
                <td>
                  <Link className="btn btn-sm btn-primary" to={`/admin/edit-side-image/${s.id}`}><i className="fas fa-edit"></i></Link>{' '}
                  <a className="btn btn-sm btn-danger" href={`/admin/delete-side-image/${s.id}`} onClick={(e) => remove(e, s.id)}><i className="fas fa-trash-alt"></i></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListPage>
  )
}

export function SideImageForm() {
  const { id } = useParams()
  const { data: row } = useApi(id ? `/admin/side-images/${id}` : null)
  const { data: subcategories } = useApi('/admin/subcategories')
  const { flash, setFlash } = useFlash()
  const submit = useSubmit('/admin/side-images', id, '/admin/show-side-images')
  if ((id && !row) || !subcategories) return null

  return (
    <FormPage title={id ? 'Edit Side Image' : 'Add New Side Image'} flash={flash} setFlash={setFlash}>
      <form onSubmit={submit} encType="multipart/form-data" key={id ?? 'new'}>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image</label>
          {id && (
            <>
              <br />
              <img width="20%" src={`/assets/welcome/images/sideimages/${row.image}`} /><br /><br />
            </>
          )}
          <input type="file" className="form-control" id="image" name="image" required={!id} />
        </div>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input type="text" className="form-control" id="title" name="title" defaultValue={row?.title} required />
        </div>
        <Select name="subcat_id" id="subcategory" label="Sub-Category" value={row?.subcat_id ?? ''}>
          {!id && <option value="">-- Select --</option>}
          {subcategories.map((s) => <option value={s.id} key={s.id}>{s.subcategory_name}</option>)}
        </Select>
        <div className="mb-3">
          <label htmlFor="url" className="form-label">URL</label>
          <input type="text" className="form-control" id="url" name="url" defaultValue={row?.url} required />
        </div>
        <div className="mb-3">
          <label htmlFor="order_no" className="form-label">Order No</label>
          <input type="number" min="0" className="form-control" id="order_no" name="order_no" defaultValue={row?.order_no} required />
        </div>
        {id && <StatusSelect value={row.status} />}
        <Buttons label={id ? 'Update' : 'Submit'} />
      </form>
    </FormPage>
  )
}
