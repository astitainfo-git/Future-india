import { Link } from 'react-router-dom'

// The body of welcome/404.html (the Molla error page shipped with the theme). CodeIgniter's own
// 404 was a bare framework page outside the site layout; this keeps visitors inside it.
export default function NotFound() {
  return (
    <main className="main">
      <nav aria-label="breadcrumb" className="breadcrumb-nav border-0 mb-0">
        <div className="container">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><a href="#">Pages</a></li>
            <li className="breadcrumb-item active" aria-current="page">404</li>
          </ol>
        </div>
      </nav>

      <div className="error-content text-center" style={{ backgroundImage: 'url(/assets/welcome/images/backgrounds/error-bg.jpg)' }}>
        <div className="container">
          <h1 className="error-title">Error 404</h1>
          <p>We are sorry, the page you&apos;ve requested is not available.</p>
          <Link to="/" className="btn btn-outline-primary-2 btn-minwidth-lg">
            <span>BACK TO HOMEPAGE</span>
            <i className="icon-long-arrow-right"></i>
          </Link>
        </div>
      </div>
    </main>
  )
}
