import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { changePassword, ChangePasswordRequest } from '../services/Auth'
import { useToast } from '../context/ToastContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import '../style/auth.css'

const emptyPasswordChange = { oldPassword: '', newPassword: '', confirmPassword: '' }

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

const extractErrorMessage = (error: any): string => {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.msg) return data.msg
  if (data?.error) return data.error
  return 'Something went wrong. Please try again.'
}

const ChangePasswordPage = () => {
  const { showToast } = useToast()
  const [newPassword, setNewPassword] = useState<ChangePasswordRequest>({ ...emptyPasswordChange })
  const [visibility, setVisibility] = useState({ old: false, new: false, confirm: false })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { username } = useParams()

  const passwordStrength = getPasswordStrength(newPassword.newPassword)
  const passwordsMatch = newPassword.confirmPassword.length > 0 && newPassword.newPassword === newPassword.confirmPassword
  const passwordsMismatch =
    newPassword.confirmPassword.length > 0 && newPassword.newPassword !== newPassword.confirmPassword

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (newPassword.newPassword !== newPassword.confirmPassword) {
      showToast('New password and confirmation do not match.', 'error')
      return
    }

    setSubmitting(true)
    try {
      await changePassword(username!, newPassword)
      showToast('Password changed successfully!', 'success')
      setNewPassword({ ...emptyPasswordChange })
      navigate(`/profile/${username}`)
    } catch (error) {
      showToast(extractErrorMessage(error), 'error')
      setSubmitting(false)
    }
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setNewPassword({ ...newPassword, [e.target.name]: e.target.value })
  }

  const toggleVisibility = (field: keyof typeof visibility) => {
    setVisibility({ ...visibility, [field]: !visibility[field] })
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <h1 className="auth-title">Change Password</h1>
        <p className="auth-subtitle">Keep your account secure with a fresh password.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-fieldset">
            <div className="field-group">
              <label className="field-label" htmlFor="oldPassword">
                Current Password
              </label>
              <div className="password-input-wrap">
                <input
                  id="oldPassword"
                  type={visibility.old ? 'text' : 'password'}
                  className="auth-input"
                  name="oldPassword"
                  value={newPassword.oldPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => toggleVisibility('old')}
                  aria-label={visibility.old ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {visibility.old ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="newPassword">
                New Password
              </label>
              <div className="password-input-wrap">
                <input
                  id="newPassword"
                  type={visibility.new ? 'text' : 'password'}
                  className="auth-input"
                  name="newPassword"
                  value={newPassword.newPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => toggleVisibility('new')}
                  aria-label={visibility.new ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {visibility.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {newPassword.newPassword && (
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
              <div className="password-input-wrap">
                <input
                  id="confirmPassword"
                  type={visibility.confirm ? 'text' : 'password'}
                  className="auth-input"
                  name="confirmPassword"
                  value={newPassword.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => toggleVisibility('confirm')}
                  aria-label={visibility.confirm ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {visibility.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordsMatch && <span className="field-hint field-hint--good">✓ Passwords match</span>}
              {passwordsMismatch && <span className="field-hint field-hint--bad">Passwords do not match</span>}
            </div>
          </div>

          <div className="auth-actions">
            <button
              className="auth-submit"
              type="submit"
              disabled={
                !newPassword.oldPassword || !newPassword.newPassword || !newPassword.confirmPassword || submitting
              }
            >
              {submitting ? 'Updating…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordPage
