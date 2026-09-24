import { Link } from 'react-router-dom'
import { Breadcrumb, Html, PageHeader } from '../components/Common'
import { useApi } from '../hooks/useApi'

// welcome/faq.php — the accordion markup itself is admin-authored content (abouts id 3).
export default function Faq() {
  const { data: page } = useApi('/pages/faq')

  return (
    <main className="main">
      <PageHeader title="F.A.Q" subtitle="Pages" />
      <Breadcrumb current="FAQ" />

      <div className="page-content">
        <div className="container">
          <h2 className="title text-center mb-3">Our FAQs</h2>
          <div className="accordion accordion-rounded" id="accordion-1">
            <Html html={page?.content} />
          </div>
        </div>
      </div>

      <div className="cta cta-display bg-image pt-4 pb-4" style={{ backgroundImage: 'url(/assets/welcome/images/backgrounds/cta/bg-7.jpg)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-9 col-xl-7">
              <div className="row no-gutters flex-column flex-sm-row align-items-sm-center">
                <div className="col">
                  <h3 className="cta-title text-white">If You Have More Questions</h3>
                  <p className="cta-desc text-white">Click here to contact us</p>
                </div>

                <div className="col-auto">
                  <Link to="/contact-us" className="btn btn-outline-white"><span>CONTACT US</span><i className="icon-long-arrow-right"></i></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
