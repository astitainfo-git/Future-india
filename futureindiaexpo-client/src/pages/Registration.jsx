import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import { Breadcrumb, Feedback } from '../components/Common'
import { useAuth } from '../hooks/useAuth'
import { recaptchaToken } from '../utils/recaptcha'
import { SocialLogin } from './Login'

// welcome/registration.php
export default function Registration() {
  const { ready, isClient } = useAuth()
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState(null)

  if (ready && isClient) return <Navigate to="/myaccount/dashboard" replace />

  // Login::store_user_details stayed on /registration only for its two validation errors;
  // success, a duplicate email and a reCAPTCHA failure all redirected to /login with a message.
  const submit = async (event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const { data } = await api.post('/auth/register', { ...form, recaptchaToken: await recaptchaToken() })
      navigate('/login', { state: { feedback: { type: 'alert-success', message: data.message } } })
    } catch (err) {
      const next = { type: 'alert-danger', message: errorMessage(err) }
      if (err.response?.status === 400) setFeedback(next)
      else navigate('/login', { state: { feedback: next } })
    }
  }

  return (
    <main className="main">
      <Breadcrumb current="Registration" className="breadcrumb-nav mb-0" />

      <div
        className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17"
        style={{ backgroundImage: "url('/assets/welcome/images/backgrounds/login-bg.jpg')" }}
      >
        <div className="container">
          <div className="form-box">
            <div className="form-tab">
              <ul className="nav nav-pills nav-fill" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="register-tab-2" data-toggle="tab" href="#register-2" role="tab" aria-controls="register-2" aria-selected="true">Register</a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane fade show active" id="register-2" role="tabpanel" aria-labelledby="register-tab-2">
                  <Feedback feedback={feedback} onClose={() => setFeedback(null)} />

                  <form onSubmit={submit}>
                    <div className="form-group">
                      <label htmlFor="first_name">First Name *</label>
                      <input type="text" className="form-control" id="first_name" name="first_name" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="last_name">Last Name *</label>
                      <input type="text" className="form-control" id="last_name" name="last_name" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="emailId">Email *</label>
                      <input type="email" className="form-control" id="emailId" name="emailId" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password *</label>
                      <input type="password" className="form-control" minLength="8" id="password" name="password" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="currency">Currency *</label>
                      <select className="form-control" id="currency" name="currency" required defaultValue="">
                        <option value="">-- Select Currency --</option>
                        <option value="inr">INR</option>
                        <option value="usd">USD</option>
                        <option value="gbp">GBP</option>
                        <option value="aud">AUD</option>
                        <option value="euro">EURO</option>
                      </select>
                    </div>

                    <div className="form-footer">
                      <button type="submit" className="btn btn-outline-primary-2">
                        <span>SIGN UP</span>
                        <i className="icon-long-arrow-right"></i>
                      </button>

                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="register-policy-2" required />
                        <label className="custom-control-label" htmlFor="register-policy-2">
                          I agree to the <Link to="/privacy-policy" target="_blank">privacy policy</Link> *
                        </label>
                      </div>
                    </div>
                  </form>
                  <SocialLogin extraFacebookSpace />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
