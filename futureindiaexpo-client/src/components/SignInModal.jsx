import { useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { jq } from '../theme/theme'
import { recaptchaToken } from '../utils/recaptcha'

// The sign-in modal from welcome/layout.php. Bootstrap 4 opens and closes it from the
// data-toggle="modal" attributes, so only the submit is wired up here.
export default function SignInModal() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login({ ...form, recaptchaToken: await recaptchaToken() })
      jq()?.('#signin-modal').modal('hide')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal fade" id="signin-modal" tabIndex="-1" role="dialog" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-body">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true"><i className="icon-close"></i></span>
            </button>

            <div className="form-box">
              <div className="form-tab">
                <ul className="nav nav-pills nav-fill" role="tablist">
                  <li className="nav-item">
                    <a className="nav-link active" id="signin-tab" data-toggle="tab" href="#signin" role="tab" aria-controls="signin" aria-selected="true">Sign In</a>
                  </li>
                </ul>
                <div className="tab-content" id="tab-content-5">
                  <div className="tab-pane fade show active" id="signin" role="tabpanel" aria-labelledby="signin-tab">
                    {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}
                    <form onSubmit={submit}>
                      <div className="form-group">
                        <label htmlFor="singin-email">Email Address *</label>
                        <input type="email" className="form-control" id="singin-email" name="email" value={form.email} onChange={change} required />
                      </div>

                      <div className="form-group">
                        <label htmlFor="singin-password">Password *</label>
                        <input type="password" className="form-control" id="singin-password" name="password" value={form.password} onChange={change} required />
                      </div>

                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" className="custom-control-input" id="signin-remember" />
                        <label className="custom-control-label" htmlFor="signin-remember">Remember Me</label>
                      </div>

                      <div className="form-footer">
                        <button type="submit" className="btn btn-outline-primary-2" disabled={busy}>
                          <span>LOG IN</span>
                          <i className="icon-long-arrow-right"></i>
                        </button>

                        <a href="#" className="forgot-link">Forgot Your Password?</a>
                      </div>
                    </form>
                    <div className="form-choice">
                      <p className="text-center">If you don&apos;t have account - <Link to="/registration">Sign Up</Link></p>
                      <p className="text-center">OR SIGN IN WITH</p>
                      <div className="row">
                        <div className="col-sm-6">
                          <a href="/auth/google" className="btn btn-login btn-g">
                            <i className="icon-google"></i>
                            Login With Google
                          </a>
                        </div>
                        <div className="col-sm-6">
                          <a href="#" className="btn btn-login btn-f">
                            <i className="icon-facebook-f"></i>
                            Login With Facebook
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
