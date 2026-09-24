import { Fragment } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ADMIN_TOKEN_KEY, tokenStore } from '../api/client'
import { useAdminTheme } from './shared'

// Sidebar links: the menu items that used full-page links in adlayout.php.
function Item({ to, children }) {
  return <Link to={to} className="dropdown-item">{children}</Link>
}

// admin/adlayout.php. Guarded like the `authadm` filter: without an admin session, go home.
export default function AdLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  useAdminTheme()

  if (!tokenStore.get(ADMIN_TOKEN_KEY)) {
    window.location.assign('/')
    return null
  }

  // Admin::logout destroyed the session and redirected to the admin login page.
  const logout = (event) => {
    event.preventDefault()
    tokenStore.clear(ADMIN_TOKEN_KEY)
    navigate('/login/future-admin-access')
  }

  return (
    <div className="container-fluid position-relative bg-white d-flex p-0">
      {/* Spinner Start */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      {/* Spinner End */}

      {/* Sidebar Start */}
      <div className="sidebar pe-4 pb-3">
        <nav className="navbar bg-light navbar-light">
          <a href="/" target="_blank" rel="noreferrer" className="navbar-brand mx-4 mb-3">
            <h4 className="text-primary">FUTURE INDIA</h4>
          </a>
          <div className="d-flex align-items-center ms-4 mb-4">
            <div className="position-relative">
              <img className="rounded-circle" src="/assets/admin/img/user.jpg" alt="" style={{ width: '40px', height: '40px' }} />
              <div className="bg-success rounded-circle border border-2 border-white position-absolute end-0 bottom-0 p-1"></div>
            </div>
            <div className="ms-3">
              <h6 className="mb-0">Hitesh</h6>
              <span>Admin</span>
            </div>
          </div>
          <div className="navbar-nav w-100">
            <Link to="/admin/dashboard" className="nav-item nav-link active"><i className="fa fa-tachometer-alt me-2"></i>Dashboard</Link>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fa fa-laptop me-2"></i>Website</a>
              <div className="dropdown-menu bg-transparent border-0">
                <Item to="/admin/show-sliders">Slider</Item>
                <Item to="/admin/show-homeimages">Home Images</Item>
                <Item to="/admin/edit-about-us">About Us</Item>
                <Item to="/admin/edit-customization">Customization</Item>
                <Item to="/admin/edit-faq">FAQ</Item>
                <Item to="/admin/edit-policy/1">Privacy Policy</Item>
                <Item to="/admin/edit-policy/2">Terms &amp; Conditions</Item>
                <Item to="/admin/edit-policy/3">Return Policy</Item>
                <Item to="/admin/show-testimonials">Testimonials</Item>
                <Item to="/admin/edit-contact-us">Contact Us</Item>
                <Item to="/admin/edit-headline">Website Headlines</Item>
                <Item to="/admin/newsletter">Newsletter Emails</Item>
              </div>
            </div>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fa fa-th me-2"></i>Categories</a>
              <div className="dropdown-menu bg-transparent border-0">
                <Item to="/admin/show-categories">Show Category</Item>
                <Item to="/admin/show-sub-categories">Show Sub-Category</Item>
              </div>
            </div>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fas fa-filter me-2"></i>Filters</a>
              <div className="dropdown-menu bg-transparent border-0">
                <Item to="/admin/show-colors">Show Colors</Item>
                <Item to="/admin/show-sizes">Show Sizes</Item>
                <Item to="/admin/show-fabrics">Show Fabrics</Item>
                <Item to="/admin/show-tags">Show Tags</Item>
              </div>
            </div>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fas fa-tasks me-2"></i>Products</a>
              <div className="dropdown-menu bg-transparent border-0">
                <Item to="/admin/add-product">Add New</Item>
                <Item to="/admin/show-all-products">Show All</Item>
                <Item to="/admin/out-of-stock-products">Out Of Stock</Item>
              </div>
            </div>
            <Link to="/admin/show-side-images" className="nav-item nav-link"><i className="fas fa-camera me-2"></i>Side Images</Link>
            <Link to="/admin/cart-details" className="nav-item nav-link"><i className="fas fa-shopping-cart me-2"></i>Cart Details</Link>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fas fa-truck-loading me-2"></i>Orders</a>
              <div className="dropdown-menu bg-transparent border-0">
                <Item to="/admin/show-all-pending-orders">Pending Orders</Item>
                <Item to="/admin/show-all-complete-orders">Complete Orders</Item>
                <Item to="/admin/show-all-cancelled-orders">Cancelled Orders</Item>
              </div>
            </div>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fas fa-users me-2"></i>Users</a>
              <div className="dropdown-menu bg-transparent border-0">
                <Item to="/admin/add-user">Add New</Item>
                <Item to="/admin/show-all-users">Show All</Item>
              </div>
            </div>
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown"><i className="fas fa-user-tie me-2"></i>Staffs</a>
              <div className="dropdown-menu bg-transparent border-0">
                <a href="#" className="dropdown-item">Add New</a>
                <Item to="/admin/show-all-staffs">Show All</Item>
              </div>
            </div>
          </div>
        </nav>
      </div>
      {/* Sidebar End */}

      {/* Content Start */}
      <div className="content">
        {/* Navbar Start */}
        <nav className="navbar navbar-expand bg-light navbar-light sticky-top px-4 py-0">
          <a href="index.html" className="navbar-brand d-flex d-lg-none me-4">
            <h2 className="text-primary mb-0"><i className="fa fa-hashtag"></i></h2>
          </a>
          <a href="#" className="sidebar-toggler flex-shrink-0">
            <i className="fa fa-bars"></i>
          </a>
          <form className="d-none d-md-flex ms-4" onSubmit={(e) => e.preventDefault()}>
            <input className="form-control border-0" type="search" placeholder="Search" />
          </form>

          <div className="navbar-nav align-items-center ms-auto">
            <div className="nav-item dropdown">
              <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                <img className="rounded-circle me-lg-2" src="/assets/admin/img/user.jpg" alt="" style={{ width: '40px', height: '40px' }} />
                <span className="d-none d-lg-inline-flex">Admin</span>
              </a>
              <div className="dropdown-menu dropdown-menu-end bg-light border-0 rounded-0 rounded-bottom m-0">
                <Link to="/admin/edit-profile" className="dropdown-item">My Profile</Link>
                <a href="/admin/logout" className="dropdown-item" onClick={logout}>Log Out</a>
              </div>
            </div>
          </div>
        </nav>
        {/* Navbar End */}

        {/* Every admin screen was a full page load; remounting per navigation keeps flash
            messages, DataTables and CKEditor instances scoped to one visit the same way. */}
        <Fragment key={location.key}>
          <Outlet />
        </Fragment>

        {/* Footer Start */}
        <div className="container-fluid pt-4 px-4">
          <div className="bg-light rounded-top p-4">
            <div className="row">
              <div className="col-12 col-sm-6 text-center text-sm-start">
                &copy; <a href="#">Future India Export</a>, All Right Reserved.
              </div>
              <div className="col-12 col-sm-6 text-center text-sm-end">
                Developed By <a href="https://www.krishnawebtechnologies.com/" target="_blank" rel="noreferrer">Krishna Web Technologies</a>
              </div>
            </div>
          </div>
        </div>
        {/* Footer End */}
      </div>
      {/* Content End */}

      {/* Back to Top */}
      <a href="#" className="btn btn-lg btn-primary btn-lg-square back-to-top"><i className="bi bi-arrow-up"></i></a>
    </div>
  )
}
