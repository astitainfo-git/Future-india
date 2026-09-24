import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import { Buttons, CkTextarea, DataTable, fail, FormPage, ListPage, ok, save, useFlash, confirmDialog } from './shared'

// admin/dashboard.php
export function Dashboard() {
  const { data } = useApi('/admin/dashboard')
  const tile = (icon, label, value) => (
    <div className="col-sm-6 col-xl-3">
      <div className="bg-light rounded d-flex align-items-center justify-content-between p-4">
        <i className={`fa ${icon} fa-3x text-primary`}></i>
        <div className="ms-3">
          <p className="mb-2">{label}</p>
          <h6 className="mb-0">{value}</h6>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container-fluid pt-4 px-4">
      <div className="row g-4">
        {tile('fa-chart-line', 'Total Users', data?.user)}
        {tile('fa-chart-bar', 'Total Products', data?.pros)}
        {tile('fa-chart-area', 'Total Categories', data?.cats)}
        {/* Hard-coded in dashboard.php. */}
        {tile('fa-chart-pie', 'Total staffs', 1234)}
      </div>
    </div>
  )
}

// admin/show-slider.php. Its edit link pointed at a view that does not exist in the PHP app.
export function Sliders() {
  const { data } = useApi('/admin/sliders')
  return (
    <ListPage title="Show All Sliders">
      <div className="table-responsive">
        <table className="table text-start align-middle table-bordered table-hover mb-0">
          <thead>
            <tr className="text-dark">
              <th scope="col">#</th>
              <th scope="col">Slider Name</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.slide_name}</td>
                <td>{s.status}</td>
                <td><Link className="btn btn-sm btn-primary" to={`/admin/edit-silder/${s.id}`}><i className="fas fa-edit"></i></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListPage>
  )
}

// admin/show-homeimages.php
export function HomeImages() {
  const { data } = useApi('/admin/home-images')
  const { flash, setFlash } = useFlash()
  return (
    <ListPage title="Show All Home Images" flash={flash} setFlash={setFlash}>
      <div className="table-responsive">
        <table className="table text-start align-middle table-bordered table-hover mb-0">
          <thead>
            <tr className="text-dark">
              <th scope="col">#</th>
              <th scope="col">First Line</th>
              <th scope="col">Second Line</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((h, i) => (
              <tr key={h.id}>
                <td>{i + 1}</td>
                <td>{h.first_line}</td>
                <td>{h.second_line}</td>
                <td><Link className="btn btn-sm btn-primary" to={`/admin/edit-homeimage/${h.id}`}><i className="fas fa-edit"></i></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListPage>
  )
}

// admin/edit-homeimage.php → Store::update_homeimagedetails → show-homeimages
export function EditHomeImage() {
  const { id } = useParams()
  const { data: item } = useApi(`/admin/home-images/${id}`)
  const { flash, setFlash, go } = useFlash()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save('put', `/admin/home-images/${id}`, e.currentTarget)
      go('/admin/show-homeimages', ok('Details Updated Successfully'))
    } catch (err) {
      go('/admin/show-homeimages', fail(err))
    }
  }

  return (
    <FormPage title="Edit Home Images Details" flash={flash} setFlash={setFlash}>
      {item && (
        <form onSubmit={submit} encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="image" className="form-label">Image</label><br />
            <img className="img-fluid" src={`/assets/welcome/images/homeimages/${item.image}`} width="40%" /><br /><br />
            <input type="file" className="form-control" id="image" name="image" />
            {Number(item.id) === 1 || Number(item.id) === 2 ? (
              <small className="text-danger">Image Size W:880px - H:500px</small>
            ) : (
              <small className="text-danger">Image Size W:580px - H:300px</small>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="first_line" className="form-label">First Line</label>
            <input type="text" className="form-control" id="first_line" defaultValue={item.first_line} name="first_line" required />
          </div>
          <div className="mb-3">
            <label htmlFor="second_line" className="form-label">Second Line</label>
            <input type="text" className="form-control" id="second_line" defaultValue={item.second_line} name="second_line" required />
          </div>
          <div className="mb-3">
            <label htmlFor="pglink" className="form-label">pglink</label>
            <textarea className="form-control" id="pglink" name="pglink" defaultValue={item.pglink} required></textarea>
          </div>
          <Buttons label="Update" />
        </form>
      )}
    </FormPage>
  )
}

const PAGE_IDS = { about: 1, customization: 2, faq: 3 }
const PAGE_TITLES = {
  about: 'Edit About Us Details',
  customization: 'Edit Customization Details',
  faq: 'Edit FAQ Details',
}

// admin/edit-about-us.php, used for About Us, Customization and FAQ (the FAQ hides the image).
export function EditPage({ slug }) {
  const id = PAGE_IDS[slug]
  const { data: page, reload } = useApi(`/admin/pages/${id}`)
  const { flash, setFlash } = useFlash()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save('put', `/admin/pages/${id}`, e.currentTarget)
      setFlash(ok('Details Updated Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  return (
    <FormPage title={PAGE_TITLES[slug]} flash={flash} setFlash={setFlash}>
      {page && (
        <form onSubmit={submit} encType="multipart/form-data" key={`${slug}-${page.image}`}>
          <div style={id === 3 ? { display: 'none' } : undefined} className="mb-3">
            <label htmlFor="image" className="form-label">Image</label><br />
            <img className="img-fluid" src={`/assets/welcome/images/${page.image}`} width="40%" /><br /><br />
            <input type="file" className="form-control" id="image" name="image" />
            <small className="text-danger">Image Size W 1920 x H 800</small>
          </div>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input type="text" className="form-control" id="title" defaultValue={page.title} name="title" required />
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">Content</label>
            <CkTextarea id="content" name="content" defaultValue={page.content} required />
          </div>
          <Buttons label="Update" />
        </form>
      )}
    </FormPage>
  )
}

// admin/edit-contact-us.php
export function EditContact() {
  const { data: rows, reload } = useApi('/admin/contacts')
  const contact = rows?.[0]
  const { flash, setFlash } = useFlash()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save('put', `/admin/contacts/${contact.id}`, e.currentTarget)
      setFlash(ok('Details Updated Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  const field = (name, label, type = 'text') => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      <input type={type} className="form-control" id={name} defaultValue={contact[name]} name={name} required />
    </div>
  )

  return (
    <FormPage title="Edit Contact Us Details" flash={flash} setFlash={setFlash}>
      {contact && (
        <form onSubmit={submit}>
          {field('mobile_no', 'Mobile No')}
          {field('email', 'Email')}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea className="form-control" id="address" name="address" defaultValue={contact.address} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="home_aboutus" className="form-label">Home Page Content Footer</label>
            <textarea className="form-control" id="home_aboutus" name="home_aboutus" defaultValue={contact.home_aboutus} required></textarea>
          </div>
          {field('facebook', 'Facebook URL')}
          {field('instagram', 'Instagram URL')}
          {field('youtube', 'Youtube')}
          {field('pinterest', 'Pinterest')}
          <Buttons label="Update" />
        </form>
      )}
    </FormPage>
  )
}

// admin/edit-headline.php
export function EditHeadline() {
  const { data: rows, reload } = useApi('/admin/headlines')
  const headline = rows?.[0]
  const { flash, setFlash } = useFlash()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save('put', `/admin/headlines/${headline.id}`, e.currentTarget)
      setFlash(ok('Details Updated Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  return (
    <FormPage title="Edit Headline of Website" flash={flash} setFlash={setFlash}>
      {headline && (
        <form onSubmit={submit}>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">Content</label>
            <textarea className="form-control" id="content" name="content" defaultValue={headline.content} required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="status" className="form-label">Status</label>
            <select className="form-control" id="status" name="status" defaultValue={headline.status} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <Buttons label="Update" />
        </form>
      )}
    </FormPage>
  )
}

// admin/edit-policy.php
export function EditPolicy() {
  const { id } = useParams()
  const { data: policy, reload } = useApi(`/admin/policies/${id}`)
  const { flash, setFlash } = useFlash()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save('put', `/admin/policies/${id}`, e.currentTarget)
      setFlash(ok('Details Updated Successfully'))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  return (
    <FormPage title={`Edit ${policy?.title ?? ''} Details`} flash={flash} setFlash={setFlash}>
      {policy && (
        <form onSubmit={submit} key={id}>
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input type="text" className="form-control" id="title" defaultValue={policy.title} name="title" required />
          </div>
          <div className="mb-3">
            <label htmlFor="content" className="form-label">Content</label>
            <CkTextarea id={`content`} name="content" defaultValue={policy.content} required />
          </div>
          <Buttons label="Update" />
        </form>
      )}
    </FormPage>
  )
}

// admin/show-testimonials.php — the list, with the edit form above it on /edit-testimonial/:id.
export function Testimonials() {
  const { id } = useParams()
  const { data, reload } = useApi('/admin/testimonials')
  const { flash, setFlash, go } = useFlash()
  const editing = id ? (data ?? []).find((t) => String(t.id) === id) : null

  const submit = async (e) => {
    e.preventDefault()
    try {
      await save('put', `/admin/testimonials/${id}`, e.currentTarget)
      reload()
      go('/admin/show-testimonials', ok('Details Updated Successfully'))
    } catch (err) {
      go('/admin/show-testimonials', fail(err))
    }
  }

  return (
    <ListPage title="Testimonials Details" centered={false} flash={flash} setFlash={setFlash}>
      <div>
        {editing && (
          <form onSubmit={submit} key={editing.id}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input type="text" className="form-control" id="title" defaultValue={editing.title} name="title" required />
            </div>
            <div className="mb-3">
              <label htmlFor="review" className="form-label">Review</label>
              <CkTextarea id="review" name="review" defaultValue={editing.review} required />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">name</label>
              <input type="text" className="form-control" id="name" defaultValue={editing.name} name="name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="country" className="form-label">country</label>
              <input type="text" className="form-control" id="country" defaultValue={editing.country} name="country" required />
            </div>
            <Buttons />
          </form>
        )}
        <br />
        <br />
      </div>
      <div className="table-responsive">
        {data && (
          <DataTable version={data.length}>
            <thead>
              <tr className="text-dark">
                <th scope="col"></th>
                <th scope="col">Title</th>
                <th scope="col">Name</th>
                <th scope="col">Country</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{t.title}</td>
                  <td>{t.name}</td>
                  <td>{t.country}</td>
                  <td><Link className="btn btn-sm btn-primary" to={`/admin/edit-testimonial/${t.id}`}><i className="fas fa-edit"></i></Link></td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </div>
    </ListPage>
  )
}

// admin/newsletter-emails.php
export function Newsletter() {
  const { data, reload } = useApi('/admin/newsletters')
  const { flash, setFlash } = useFlash()

  const remove = async (e, id) => {
    e.preventDefault()
    if (!confirmDialog()) return
    try {
      const { data: res } = await api.delete(`/admin/newsletters/${id}`)
      setFlash(ok(res.message))
      reload()
    } catch (err) {
      setFlash(fail(err))
    }
  }

  return (
    <ListPage title="Show All Newsletter Emails" flash={flash} setFlash={setFlash}>
      <div className="table-responsive">
        <table className="table text-start align-middle table-bordered table-hover mb-0">
          <thead>
            <tr className="text-dark">
              <th scope="col">#</th>
              <th scope="col">Email</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((n, i) => (
              <tr key={n.id}>
                <td>{i + 1}</td>
                <td>{n.email}</td>
                <td>
                  <a className="btn btn-sm btn-danger" href={`/admin/delete-newsletter-email/${n.id}`} onClick={(e) => remove(e, n.id)}>
                    <i className="fas fa-trash-alt"></i>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListPage>
  )
}

// admin/showallstaffs.php — static placeholder rows in the PHP template, kept verbatim.
export function Staffs() {
  const row = (i) => (
    <tr key={i}>
      <td><input className="form-check-input" type="checkbox" /></td>
      <td>01 Jan 2045</td>
      <td>INV-0123</td>
      <td>Jhon Doe</td>
      <td>$123</td>
      <td>Paid</td>
      <td><a className="btn btn-sm btn-primary" href="">Detail</a></td>
    </tr>
  )
  return (
    <div className="container-fluid pt-4 px-4">
      <div className="bg-light text-center rounded p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 text-primary">Show All Staffs</h6>
        </div>
        <div className="table-responsive">
          <table className="table text-start align-middle table-bordered table-hover mb-0">
            <thead>
              <tr className="text-dark">
                <th scope="col"><input className="form-check-input" type="checkbox" /></th>
                <th scope="col">Date</th>
                <th scope="col">Invoice</th>
                <th scope="col">Customer</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>{[0, 1, 2, 3, 4].map(row)}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// admin/edit-profile.php — two forms, each with its own flash.
export function EditProfile() {
  const { data: admin } = useApi('/admin/profile')
  const profile = useFlash()
  const password = useFlash()

  const submitProfile = async (e) => {
    e.preventDefault()
    try {
      const { data } = await save('put', '/admin/profile', e.currentTarget)
      profile.setFlash(ok(data.message))
    } catch (err) {
      profile.setFlash(fail(err))
    }
  }

  const submitPassword = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    try {
      const { data } = await save('put', '/admin/password', form)
      password.setFlash(ok(data.message))
      form.reset()
    } catch (err) {
      password.setFlash(fail(err))
    }
  }

  const alert = ({ flash, setFlash }) =>
    flash?.message && (
      <div className={`alert ${flash.type} alert-dismissible fade show`} role="alert">
        {flash.message}
        <button type="button" className="btn-close" aria-label="Close" onClick={() => setFlash(null)}></button>
      </div>
    )

  return (
    <>
      <div className="container-fluid pt-4 px-4">
        <div className="row g-4">
          <div className="col-sm-12 col-xl-6">
            <div className="bg-light rounded h-100 p-4">
              <h6 className="mb-4 text-primary">Admin Details</h6>
              {alert(profile)}
              {admin && (
                <form onSubmit={submitProfile}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" defaultValue={admin.name} name="name" required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" defaultValue={admin.email} name="email" required />
                  </div>
                  <Buttons label="Update" />
                </form>
              )}
            </div>
          </div>
          <div className="col-sm-12 col-xl-6">
            <div className="bg-light rounded h-100 p-4">
              <h6 className="mb-4 text-primary">Change Password</h6>
              {alert(password)}
              <form onSubmit={submitPassword}>
                <div className="mb-3">
                  <label htmlFor="currpassword" className="form-label">Current Password</label>
                  <input type="password" className="form-control" id="currpassword" name="currpassword" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="newpassword" className="form-label">New Password</label>
                  <input type="password" className="form-control" id="newpassword" name="newpassword" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmpassword" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmpassword" name="confirmpassword" required />
                </div>
                <Buttons label="Update" />
              </form>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </>
  )
}
