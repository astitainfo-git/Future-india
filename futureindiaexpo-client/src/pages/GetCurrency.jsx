import { Navigate, useLocation } from 'react-router-dom'
import { Breadcrumb, Feedback } from '../components/Common'

// welcome/getcurrency_page.php. In PHP this was only reachable after a first Google sign-in
// (Home::get_user_currency required the 'eml' session key, otherwise it redirected home).
// OAuth is not ported yet, so without that pending state the page does the same redirect.
export default function GetCurrency() {
  const { state } = useLocation()
  if (!state?.pendingEmail) return <Navigate to="/" replace />

  return (
    <main className="main">
      <Breadcrumb current="Select Currency" className="breadcrumb-nav mb-0" />

      <div
        className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17"
        style={{ backgroundImage: "url('/assets/welcome/images/backgrounds/login-bg.jpg')" }}
      >
        <div className="container">
          <div className="form-box">
            <div className="form-tab">
              <ul className="nav nav-pills nav-fill" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="signin-tab-2" data-toggle="tab" href="#signin-2" role="tab" aria-controls="signin-2" aria-selected="false">Select Currency</a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane fade show active" id="signin-2" role="tabpanel" aria-labelledby="signin-tab-2">
                  <Feedback
                    dismissible={false}
                    feedback={{
                      type: 'alert-warning',
                      message: 'Please select a currency first to complete your login process. You cannot refresh this page.',
                    }}
                  />

                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                      <label htmlFor="currency">Currency *</label>
                      <select className="form-control" id="currency" name="currency" required>
                        <option value="inr">INR</option>
                        <option value="usd">USD</option>
                        <option value="gbp">GBP</option>
                        <option value="aud">AUD</option>
                        <option value="euro">EURO</option>
                      </select>
                    </div>

                    <div className="form-footer">
                      <button type="submit" className="btn btn-outline-primary-2">
                        <span>SUBMIT</span>
                        <i className="icon-long-arrow-right"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
