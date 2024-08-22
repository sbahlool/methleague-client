import { useState } from 'react'
// import { forgotPass } from '../services/Auth' // Import the forgot password service function

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      // await forgotPass(email)
      setMessage('Password reset email sent. Please check your inbox.')
      setError('')
    } catch (err) {
      setError('Error sending password reset email. Please try again.')
      setMessage('')
    }
  }

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p className="message">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default ForgotPassword
