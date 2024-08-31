import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { resetPassword } from '../services/Auth'

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const { token } = useParams()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      await resetPassword(token!, newPassword)
      setMessage('Your password has been successfully reset.')
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    }
  }

  return (
    <div className="reset-password">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
        />
        <button type="submit">Set New Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default ResetPassword
