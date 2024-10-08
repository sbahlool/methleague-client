import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { changePassword, ChangePasswordRequest } from '../services/Auth'
import '../style/changePass.css'

const emptyPasswordChange = { oldPassword: '', newPassword: '', confirmPassword: '' }

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState<ChangePasswordRequest>({ ...emptyPasswordChange })
  const navigate = useNavigate()
  const { username } = useParams()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await changePassword(username!, newPassword)
    setNewPassword({ ...emptyPasswordChange })
    navigate(`/profile/${username}`)
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setNewPassword({ ...newPassword, [e.target.name]: e.target.value })
  }

  return (
    <div className="change-password-container">
      <h1 className="change-password-title">Change Password</h1>
      <form className="change-password-form" onSubmit={handleSubmit}>
        <label className="change-password-label" htmlFor="oldPassword">
          Current Password
        </label>
        <input
          type="password"
          className="change-password-input"
          name="oldPassword"
          placeholder="Current Password"
          value={newPassword.oldPassword}
          onChange={handleChange}
          required
        />

        <label className="change-password-label" htmlFor="newPassword">
          New Password
        </label>
        <input
          type="password"
          className="change-password-input"
          name="newPassword"
          placeholder="New Password"
          value={newPassword.newPassword}
          onChange={handleChange}
          required
        />

        <label className="change-password-label" htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          type="password"
          className="change-password-input"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={newPassword.confirmPassword}
          onChange={handleChange}
          required
        />

        <button
          className="change-password-button"
          type="submit"
          disabled={!newPassword.oldPassword || !newPassword.newPassword || !newPassword.confirmPassword}
        >
          Change Password
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordPage
