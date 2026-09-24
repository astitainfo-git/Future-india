import { Link, useParams } from 'react-router-dom'
import { Breadcrumb, PageHeader } from '../components/Common'
import { useApi } from '../hooks/useApi'

// welcome/show-subcategories.php. Its route is commented out in Routes.php, so nothing links
// here on the PHP site either; the page is kept so the view is not lost.
export default function ShowSubcategories() {
  const { alias } = useParams()
  const { data } = useApi(`/categories/${alias}/subcategories`)
  const category = data?.category

  return (
    <main className="main">
      <PageHeader title={category?.category_name} />
      <Breadcrumb current={category?.category_name} className="breadcrumb-nav mb-2" />

      <div className="page-content">
        <div className="container">
          <div className="entry-container max-col-4" data-layout="fitRows">
            {(data?.subcategories ?? []).map((sub) => (
              <div className="entry-item lifestyle shopping col-sm-6 col-md-4 col-lg-3" key={sub.id}>
                <article className="entry entry-grid text-center">
                  <figure className="entry-media">
                    <Link to={`/products/${sub.subcategory_alias}`}>
                      <img src={`/assets/welcome/images/subcategory/${sub.image}`} alt="" />
                    </Link>
                  </figure>
                  <div className="entry-body">
                    <h2 className="entry-title">
                      <Link to={`/products/${sub.subcategory_alias}`}>{sub.subcategory_name}</Link>
                    </h2>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
