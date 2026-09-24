import { Breadcrumb, PageHeader } from '../components/Common'

// welcome/thankspage.php
export default function ThanksPage() {
  return (
    <main className="main">
      <PageHeader title="Thanks" subtitle="Page" />
      <Breadcrumb current="Thanks Page" />

      <div className="page-content">
        <div className="checkout">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center">
                <div className="tik">
                  <i className="icon-check"></i>
                </div>
                <h2 className="h1">Thanks You</h2>
                <h4>Your order placed successfully</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
