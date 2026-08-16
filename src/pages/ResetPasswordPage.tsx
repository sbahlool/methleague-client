import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../services/Auth'
import { useToast } from '../context/ToastContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import '../style/auth.css'

const getPasswordStrength = (password: string) => {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (password.length >= 12) score++

  if (!password) return { score: 0, label: '', className: '' }
  if (score <= 1) return { score, label: 'Weak', className: 'weak' }
  if (score <= 3) return { score, label: 'Fair', className: 'fair' }
  return { score, label: 'Strong', className: 'strong' }
}

const ResetPassword = () => {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const { token } = useParams()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const passwordStrength = getPasswordStrength(newPassword)
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword(token!, newPassword)
      showToast('Password reset successfully!', 'success')
      setDone(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (error) {
      console.error('Error resetting password:', error)
      showToast('That reset link may be invalid or expired. Please request a new one.', 'error')
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>

        <div className="auth-form">
          {done ? (
            <p className="field-hint field-hint--good" style={{ fontSize: '14px', textAlign: 'center' }}>
              Your password has been reset. Redirecting to sign in…
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="auth-fieldset">
                <div className="field-group">
                  <label className="field-label" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="password-input-wrap">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
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
                  {newPassword && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div
                          className={`password-strength-fill ${passwordStrength.className}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`password-strength-label ${passwordStrength.className}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {passwordsMatch && <span className="field-hint field-hint--good">✓ Passwords match</span>}
                  {passwordsMismatch && <span className="field-hint field-hint--bad">Passwords do not match</span>}
                </div>
              </div>

              <div className="auth-actions">
                <button
                  className="auth-submit"
                  type="submit"
                  disabled={!newPassword || !confirmPassword || submitting}
                >
                  {submitting ? 'Resetting…' : 'Set New Password'}
                </button>
              </div>
            </form>
          )}

          {!done && (
            <p className="auth-footer-link">
              <Link to="/login">Back to sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
