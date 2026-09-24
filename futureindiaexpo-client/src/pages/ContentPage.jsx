import { Breadcrumb, Html, PageHeader } from '../components/Common'
import { useApi } from '../hooks/useApi'

// welcome/aboutus.php and welcome/customization.php are the same template with a different
// title; both read a row from `abouts` (id 1 and 2).
export default function ContentPage({ slug, title }) {
  const { data: page } = useApi(`/pages/${slug}`)

  return (
    <main className="main">
      <PageHeader title={title} />
      <Breadcrumb current={title} className="breadcrumb-nav mb-2" />

      <div className="page-content pb-0">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mb-3 mb-lg-0">
              {page && <img src={`/assets/welcome/images/${page.image}`} alt="Future India Export" />}
            </div>

            <div className="col-lg-12">
              <Html html={page?.content} />
            </div>
          </div>

          <div className="mb-5"></div>
        </div>
      </div>
    </main>
  )
}
