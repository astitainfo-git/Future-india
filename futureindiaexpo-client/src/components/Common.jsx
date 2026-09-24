import { Link } from 'react-router-dom'

// `<div class="page-header text-center" style="background-image: url(page-header-bg.jpg)">`
export function PageHeader({ title, subtitle, image = '/assets/welcome/images/page-header-bg.jpg' }) {
  return (
    <div className="page-header text-center" style={{ backgroundImage: `url('${image}')` }}>
      <div className="container">
        <h1 className="page-title">
          {title}
          {subtitle && <span>{subtitle}</span>}
        </h1>
      </div>
    </div>
  )
}

// The breadcrumb nav each template opened with; `className` carries the per-page spacing
// (mb-2, mb-0, border-0 mb-0, …) exactly as the PHP markup had it.
export function Breadcrumb({ current, className = 'breadcrumb-nav', containerClass = 'container', children }) {
  return (
    <nav aria-label="breadcrumb" className={className}>
      <div className={containerClass}>
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{current}</li>
        </ol>
        {children}
      </div>
    </nav>
  )
}

// Admin-authored HTML (CKEditor content) that PHP echoed unescaped. display:contents keeps the
// wrapper element from affecting layout, so the output sits where the echo did.
export function Html({ html }) {
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html ?? '' }} />
}

// The flashdata alert: `<div class="alert <feedback_class> alert-dismissible fade show mb-3">`.
export function Feedback({ feedback, onClose, className = 'mb-3', dismissible = true }) {
  if (!feedback?.message) return null
  return (
    <div className={`alert ${feedback.type} ${dismissible ? 'alert-dismissible ' : ''}fade show ${className}`} role="alert">
      {feedback.message}
      {dismissible && (
        <button type="button" className="close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  )
}
