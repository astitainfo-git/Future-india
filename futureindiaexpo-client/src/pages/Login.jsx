import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { Breadcrumb, Feedback } from '../components/Common'
import { useAuth } from '../hooks/useAuth'
import { recaptchaToken } from '../utils/recaptcha'

export function SocialLogin({ extraFacebookSpace = false }) {
  return (
    <div className="form-choice">
      <p className="text-center">or sign in with</p>
      <div className="row">
        <div className="col-sm-6">
          <a href="/auth/google" className="btn btn-login btn-g">
            <i className="icon-google"></i>
            Login With Google
          </a>
        </div>
        <div className="col-sm-6">
          <a href="#" className={extraFacebookSpace ? 'btn btn-login  btn-f' : 'btn btn-login btn-f'}>
            <i className="icon-facebook-f"></i>
            Login With Facebook
          </a>
        </div>
      </div>
    </div>
  )
}

// welcome/login.php
export default function Login() {
  const { ready, isClient, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  // Flashdata carried over from the registration redirect.
  const [feedback, setFeedback] = useState(location.state?.feedback ?? null)

  // Login::index sent logged-in clients to their dashboard.
  if (ready && isClient) return <Navigate to="/myaccount/dashboard" replace />

  const submit = async (event) => {
    event.preventDefault()
    const form = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await login({ ...form, recaptchaToken: await recaptchaToken() })
      navigate('/myaccount/dashboard')
    } catch (err) {
      setFeedback({ type: 'alert-danger', message: errorMessage(err) })
    }
  }

  return (
    <main className="main">
      <Breadcrumb current="Login" className="breadcrumb-nav mb-0" />

      <div
        className="login-page bg-image pt-8 pb-8 pt-md-12 pb-md-12 pt-lg-17 pb-lg-17"
        style={{ backgroundImage: "url('/assets/welcome/images/backgrounds/login-bg.jpg')" }}
      >
        <div className="container">
          <div className="form-box">
            <div className="form-tab">
              <ul className="nav nav-pills nav-fill" role="tablist">
                <li className="nav-item">
                  <a className="nav-link active" id="signin-tab-2" data-toggle="tab" href="#signin-2" role="tab" aria-controls="signin-2" aria-selected="false">Sign In</a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane fade show active" id="signin-2" role="tabpanel" aria-labelledby="signin-tab-2">
                  <Feedback feedback={feedback} onClose={() => setFeedback(null)} />

                  <form onSubmit={submit}>
                    <div className="form-group">
                      <label htmlFor="singin-email-2">Email Address *</label>
                      <input type="email" className="form-control" id="singin-email-2" name="email" required />
                    </div>

                    <div className="form-group">
                      <label htmlFor="singin-password-2">Password *</label>
                      <input type="password" className="form-control" id="singin-password-2" name="password" required />
                    </div>

                    <div className="form-footer">
                      <button type="submit" className="btn btn-outline-primary-2">
                        <span>LOG IN</span>
                        <i className="icon-long-arrow-right"></i>
                      </button>

                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="signin-remember-2" />
                        <label className="custom-control-label" htmlFor="signin-remember-2">Remember Me</label>
                      </div>

                      <a href="#" className="forgot-link">Forgot Your Password?</a>
                    </div>
                  </form>
                  <SocialLogin />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
