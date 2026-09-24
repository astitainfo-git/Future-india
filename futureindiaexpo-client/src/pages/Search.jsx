import { useSearchParams } from 'react-router-dom'
import { Breadcrumb, PageHeader } from '../components/Common'
import ProductCard from '../components/ProductCard'
import { useApi } from '../hooks/useApi'

// welcome/search.php — /search?srch=<term>, the query name the header form used.
export default function Search() {
  const [params] = useSearchParams()
  const term = params.get('srch') ?? ''
  const { data } = useApi(`/search?srch=${encodeURIComponent(term)}`)

  return (
    <main className="main">
      <PageHeader title="Search" />
      <Breadcrumb current="Search" className="breadcrumb-nav mb-2" />

      <div className="page-content" id="cusFilter">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="products mb-3">
                <div className="row justify-content-center">
                  {(data ?? []).map((p) => (
                    <div className="col-6 col-md-4 col-lg-4 col-xl-3" key={p.id}>
                      <ProductCard product={p} image={p.image} showSku imageAlt="Product image" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
