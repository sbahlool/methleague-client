import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../services/Auth'
import { useToast } from '../context/ToastContext'
import '../style/auth.css'

const ForgotPassword = () => {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await forgotPassword(email)
      // Same message regardless of whether the account exists — the
      // backend intentionally never reveals that, so the frontend
      // shouldn't either.
      setSubmitted(true)
    } catch (error) {
      console.error('Error requesting password reset:', error)
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-subtitle">We'll email you a link to reset it.</p>

        <div className="auth-form">
          {submitted ? (
            <div className="field-group">
              <p className="field-hint field-hint--good" style={{ fontSize: '14px', textAlign: 'center' }}>
                If an account with that email exists, we've sent a password reset link. Check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-fieldset">
                <div className="field-group">
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="auth-actions">
                <button className="auth-submit" type="submit" disabled={!email || submitting}>
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          <p className="auth-footer-link">
            Remembered it? <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
