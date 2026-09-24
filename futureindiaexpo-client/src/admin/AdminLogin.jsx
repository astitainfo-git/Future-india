import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_TOKEN_KEY, api, errorMessage, tokenStore } from '../api/client'

// welcome/adminlogin.php at /login/future-admin-access
export default function AdminLogin() {
  const navigate = useNavigate()
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    document.title = 'Future India Import:: Login Page'
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/admin/login', Object.fromEntries(new FormData(e.currentTarget)))
      tokenStore.set(ADMIN_TOKEN_KEY, data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      setFlash(errorMessage(err))
    }
  }

  return (
    <div className="container-fluid position-relative bg-dark d-flex p-0">
      {/* Sign In Start */}
      <div className="container-fluid">
        <div className="row h-100 align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <div className="col-12 col-sm-8 col-md-6 col-lg-5 col-xl-4">
            {flash && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {flash}
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setFlash(null)}></button>
              </div>
            )}

            <div className="bg-white rounded p-4 p-sm-5 my-4 mx-3">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <img className="img-fluid" src="/assets/welcome/images/futurelogo.png" />
              </div>
              <form onSubmit={submit}>
                <div className="form-floating mb-3">
                  <input type="email" className="form-control" name="email" id="floatingInput" required />
                  <label htmlFor="floatingInput">Email address</label>
                </div>
                <div className="form-floating mb-4">
                  <input type="password" className="form-control" name="password" id="floatingPassword" required />
                  <label htmlFor="floatingPassword">Password</label>
                </div>
                <button type="submit" className="btn btn-primary py-3 w-100 mb-4">Sign In</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Sign In End */}
    </div>
  )
}
