import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdLayout from './AdLayout'
import AdminLogin from './AdminLogin'
import {
  CategoryForm,
  Categories,
  Filters,
  ProductForm,
  ProductImages,
  Products,
  SideImageForm,
  SideImages,
  SubcategoryForm,
  Subcategories,
} from './CatalogPages'
import {
  Dashboard,
  EditContact,
  EditHeadline,
  EditHomeImage,
  EditPage,
  EditPolicy,
  EditProfile,
  HomeImages,
  Newsletter,
  Sliders,
  Staffs,
  Testimonials,
} from './ContentPages'
import { AdminInvoice, CartDetails, ClientCartDetails, Orders, UserForm, Users } from './CustomerPages'

// Every page under adlayout.php had this title.
function LayoutTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/admin/') && !pathname.includes('print-pi-details') && !pathname.includes('client-cart-details')) {
      document.title = 'Dashboard - Future India Export'
    }
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// The `admin` route group from app/Config/Routes.php, at the same URLs.
export default function AdminApp() {
  return (
    <>
      <LayoutTitle />
      <Routes>
        <Route path="/login/future-admin-access" element={<AdminLogin />} />

        {/* Standalone documents without the admin layout. */}
        <Route path="/admin/print-pi-details/:id" element={<AdminInvoice />} />
        <Route path="/admin/client-cart-details/:id" element={<ClientCartDetails />} />

        <Route path="/admin" element={<AdLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="edit-profile" element={<EditProfile />} />

          <Route path="show-sliders" element={<Sliders />} />
          <Route path="show-homeimages" element={<HomeImages />} />
          <Route path="edit-homeimage/:id" element={<EditHomeImage />} />
          <Route path="edit-about-us" element={<EditPage slug="about" />} />
          <Route path="edit-customization" element={<EditPage slug="customization" />} />
          <Route path="edit-faq" element={<EditPage slug="faq" />} />
          <Route path="edit-contact-us" element={<EditContact />} />
          <Route path="edit-headline" element={<EditHeadline />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="show-testimonials" element={<Testimonials />} />
          <Route path="edit-testimonial/:id" element={<Testimonials />} />
          <Route path="edit-policy/:id" element={<EditPolicy />} />

          <Route path="show-categories" element={<Categories />} />
          <Route path="add-category" element={<CategoryForm />} />
          <Route path="edit-category/:id" element={<CategoryForm />} />
          <Route path="show-sub-categories" element={<Subcategories />} />
          <Route path="add-sub-category" element={<SubcategoryForm />} />
          <Route path="edit-sub-category/:id" element={<SubcategoryForm />} />

          <Route path="show-colors" element={<Filters type="color" />} />
          <Route path="show-sizes" element={<Filters type="size" />} />
          <Route path="show-fabrics" element={<Filters type="fabric" />} />
          <Route path="show-tags" element={<Filters type="tags" />} />
          <Route path="edit-color/:id" element={<Filters type="color" />} />
          <Route path="edit-size/:id" element={<Filters type="size" />} />
          <Route path="edit-fabric/:id" element={<Filters type="fabric" />} />
          <Route path="edit-tags/:id" element={<Filters type="tags" />} />

          <Route path="show-all-products" element={<Products />} />
          <Route path="add-product" element={<ProductForm />} />
          <Route path="edit-product/:id" element={<ProductForm />} />
          <Route path="edit-product-images/:id" element={<ProductImages />} />

          <Route path="show-all-users" element={<Users />} />
          <Route path="add-user" element={<UserForm />} />
          <Route path="edit-user/:id" element={<UserForm />} />

          <Route path="show-side-images" element={<SideImages />} />
          <Route path="add-side-image" element={<SideImageForm />} />
          <Route path="edit-side-image/:id" element={<SideImageForm />} />

          <Route path="cart-details" element={<CartDetails />} />
          <Route path="show-all-pending-orders" element={<Orders status="pending" />} />
          <Route path="show-all-complete-orders" element={<Orders status="complete" />} />
          <Route path="show-all-cancelled-orders" element={<Orders status="cancelled" />} />

          <Route path="show-all-staffs" element={<Staffs />} />

          {/* e.g. out-of-stock-products and edit-silder/:id, linked from PHP but never routed. */}
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </>
  )
}

function AdminNotFound() {
  return (
    <div className="container-fluid pt-4 px-4">
      <div className="row vh-100 bg-light rounded align-items-center justify-content-center mx-0">
        <div className="col-md-6 text-center p-4">
          <i className="bi bi-exclamation-triangle display-1 text-primary"></i>
          <h1 className="display-1 fw-bold">404</h1>
          <h1 className="mb-4">Page Not Found</h1>
          <p className="mb-4">We’re sorry, the page you have looked for does not exist in our website!
            Maybe go to our home page or try to use a search?</p>
          <a className="btn btn-primary rounded-pill py-3 px-5" href="/admin/dashboard">Go Back To Home</a>
        </div>
      </div>
    </div>
  )
}
