import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, UserResponse } from '../services/Auth'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import '../style/auth.css'

interface Props {
  setUser: (user: UserResponse) => void
}

const Login = ({ setUser }: Props) => {
  const navigate = useNavigate()

  const [formValues, setFormValues] = useState({ username: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const payload = await loginUser(formValues)
      setFormValues({ username: '', password: '' })
      setUser(payload as unknown as UserResponse)
      navigate('/')
    } catch (_) {
      setErrorMessage('Invalid username or password. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to make your picks.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-fieldset">
            <div className="field-group">
              <label className="field-label" htmlFor="username">
                Username or Email
              </label>
              <input
                id="username"
                onChange={handleChange}
                name="username"
                className="auth-input"
                type="text"
                value={formValues.username}
                required
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  onChange={handleChange}
                  name="password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={formValues.password}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            </div>
          </div>

          {errorMessage && <div className="auth-error">{errorMessage}</div>}

          <div className="auth-actions">
            <button
              className="auth-submit"
              type="submit"
              disabled={!formValues.username || !formValues.password || submitting}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          <p className="auth-footer-link">
            Don&apos;t have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
