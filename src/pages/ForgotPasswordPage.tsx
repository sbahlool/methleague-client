import { useState } from 'react'
import { forgotPassword } from '../services/Auth'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      setMessage('If an account with that email exists, we have sent a password reset link.')
    } catch (error: unknown) {
      console.error('Error in handleSubmit:', error)
      setMessage(`An error occurred: ${(error as { message: string }).message}`)
    }
  }

  return (
    <div className="forgot-password">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ForgotPassword
