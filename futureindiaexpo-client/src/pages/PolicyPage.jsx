import { useLocation } from 'react-router-dom'
import { Breadcrumb, Html } from '../components/Common'
import { useApi } from '../hooks/useApi'

// welcome/policy-page.php, served at /privacy-policy, /terms-conditions and /return-policy.
export default function PolicyPage() {
  const slug = useLocation().pathname.slice(1)
  const { data: policy } = useApi(`/policies/${slug}`)

  return (
    <main className="main">
      <Breadcrumb current={policy?.title} className="breadcrumb-nav border-0 mb-0" />

      <div className="page-content pb-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb-3 mb-lg-0">
              <h2 className="title">{policy?.title}</h2>
              <Html html={policy?.content} />
            </div>
          </div>
        </div>

        <div className="mb-2"></div>
      </div>
    </main>
  )
}
