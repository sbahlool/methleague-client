import { useEffect, useState } from 'react'
import { registerUser, loginUser, UserResponse, TeamResponse, getTeams } from '../services/Auth'
import { useNavigate, Link } from 'react-router-dom'
import '../style/auth.css'

interface Props {
  setUser: (user: UserResponse) => void
}

const STEPS = ['Account', 'Profile', 'Team'] as const

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
  if (data?.error) return data.error
  if (data?.msg) return data.msg
  return 'Something went wrong. Please try again.'
}

const Register = ({ setUser }: Props) => {
  const navigate = useNavigate()

  const [step, setStep] = useState<number>(0)
  const [stepError, setStepError] = useState<string>('')
  const [apiError, setApiError] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    team: '',
  })
  const [teams, setTeams] = useState<TeamResponse[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams()
        setTeams(data)
      } catch (error) {
        console.error('Failed to fetch teams', error)
      }
    }
    fetchTeams()
  }, [])

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  const selectedTeam = teams.find((team) => team._id === formValues.team)
  const passwordStrength = getPasswordStrength(formValues.password)
  const passwordsMatch = formValues.confirmPassword.length > 0 && formValues.password === formValues.confirmPassword
  const passwordsMismatch =
    formValues.confirmPassword.length > 0 && formValues.password !== formValues.confirmPassword

  const validateStep = (currentStep: number): string => {
    if (currentStep === 0) {
      if (!formValues.email || !formValues.username || !formValues.password || !formValues.confirmPassword) {
        return 'Please fill in every field.'
      }
      if (formValues.password !== formValues.confirmPassword) {
        return 'Passwords do not match.'
      }
      if (formValues.password.length < 6) {
        return 'Password should be at least 6 characters.'
      }
    }
    if (currentStep === 1) {
      if (!formValues.firstname || !formValues.lastname) {
        return 'Please enter your first and last name.'
      }
    }
    return ''
  }

  const handleNext = () => {
    const error = validateStep(step)
    if (error) {
      setStepError(error)
      return
    }
    setStepError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setStepError('')
    setApiError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (!formValues.team) {
      setStepError('Please select a favorite team.')
      return
    }

    setSubmitting(true)
    setApiError('')

    try {
      await registerUser({
        username: formValues.username,
        email: formValues.email,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
        firstname: formValues.firstname,
        lastname: formValues.lastname,
        team: formValues.team,
      })

      const payload = await loginUser(formValues)
      setUser(payload as unknown as UserResponse)
      navigate('/')
    } catch (error) {
      setApiError(extractErrorMessage(error))
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join the league and start predicting scores.</p>

        <div className="auth-steps">
          {STEPS.map((label, index) => (
            <div key={label} className="auth-step">
              <button
                type="button"
                className={`auth-step-dot ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
                onClick={() => index < step && setStep(index)}
                disabled={index > step}
                aria-label={`Step ${index + 1}: ${label}`}
              >
                {index < step ? '✓' : index + 1}
              </button>
              <span className={`auth-step-label ${index === step ? 'active' : ''}`}>{label}</span>
              {index < STEPS.length - 1 && <span className={`auth-step-line ${index < step ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* -------------------------------------------------- */}
          {/* Step 1: Account                                     */}
          {/* -------------------------------------------------- */}
          {step === 0 && (
            <div className="auth-fieldset">
              <div className="field-group">
                <label className="field-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  onChange={handleChange}
                  name="email"
                  className="auth-input"
                  type="email"
                  value={formValues.email}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  onChange={handleChange}
                  name="username"
                  className="auth-input"
                  type="text"
                  value={formValues.username}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  onChange={handleChange}
                  name="password"
                  className="auth-input"
                  type="password"
                  value={formValues.password}
                  required
                />
                {formValues.password && (
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
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  onChange={handleChange}
                  name="confirmPassword"
                  className="auth-input"
                  type="password"
                  value={formValues.confirmPassword}
                  required
                />
                {passwordsMatch && <span className="field-hint field-hint--good">✓ Passwords match</span>}
                {passwordsMismatch && <span className="field-hint field-hint--bad">Passwords do not match</span>}
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* Step 2: Profile                                     */}
          {/* -------------------------------------------------- */}
          {step === 1 && (
            <div className="auth-fieldset">
              <div className="field-group">
                <label className="field-label" htmlFor="firstname">
                  First Name
                </label>
                <input
                  id="firstname"
                  onChange={handleChange}
                  name="firstname"
                  className="auth-input"
                  type="text"
                  value={formValues.firstname}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="lastname">
                  Last Name
                </label>
                <input
                  id="lastname"
                  onChange={handleChange}
                  name="lastname"
                  className="auth-input"
                  type="text"
                  value={formValues.lastname}
                  required
                />
              </div>
            </div>
          )}

          {/* -------------------------------------------------- */}
          {/* Step 3: Favorite team                               */}
          {/* -------------------------------------------------- */}
          {step === 2 && (
            <div className="auth-fieldset">
              <p className="team-grid-label">Pick your favorite team</p>
              <div className="team-grid">
                {teams.map((team) => (
                  <button
                    type="button"
                    key={team._id}
                    className={`team-card ${formValues.team === team._id ? 'selected' : ''}`}
                    onClick={() => setFormValues({ ...formValues, team: team._id })}
                  >
                    <img className="team-card-logo" src={`/uploads/${team.logo}`} alt={`${team.teamname} logo`} />
                    <span className="team-card-name">{team.teamname}</span>
                  </button>
                ))}
              </div>

              {selectedTeam && (
                <div className="profile-preview">
                  <div className="preview-label">Your profile preview</div>
                  <div className="preview-card">
                    <div className="preview-avatar">
                      {formValues.firstname.charAt(0)}
                      {formValues.lastname.charAt(0)}
                    </div>
                    <div className="preview-name">
                      {formValues.firstname} {formValues.lastname}
                    </div>
                    <div className="preview-username">@{formValues.username}</div>
                    <div className="preview-team">
                      <img
                        className="preview-team-logo"
                        src={`/uploads/${selectedTeam.logo}`}
                        alt={`${selectedTeam.teamname} logo`}
                      />
                      <span>{selectedTeam.teamname}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {stepError && <div className="auth-error">{stepError}</div>}
          {apiError && <div className="auth-error">{apiError}</div>}

          <div className="auth-actions">
            {step > 0 && (
              <button type="button" className="btn-ghost-pill" onClick={handleBack}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 && (
              <button type="button" className="auth-submit" onClick={handleNext}>
                Next
              </button>
            )}
            {step === STEPS.length - 1 && (
              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Register'}
              </button>
            )}
          </div>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
