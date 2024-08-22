import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoginResponse, loginUser } from '../services/Auth'
import '../style/auth.css'

interface Props {
  setUser: (user: LoginResponse['user']) => void
}

const Login = ({ setUser }: Props) => {
  let navigate = useNavigate()

  const [formValues, setFormValues] = useState({ username: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      const payload = await loginUser(formValues)
      setFormValues({ username: '', password: '' })
      setUser(payload)
      navigate('/')
    } catch (error) {
      setErrorMessage('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="container" style={{ padding: '50px 0 50px 0' }}>
      <h1 style={{ textAlign: 'center' }}>Login to your account</h1>
      <br />
      <div>
        <form className="form" onSubmit={handleSubmit}>
          {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
          <label className="label" htmlFor="username">
            Username or Email
          </label>
          <input
            onChange={handleChange}
            name="username"
            className="input"
            type="text"
            value={formValues.username}
            required
          />
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            onChange={handleChange}
            name="password"
            className="input"
            type="password"
            value={formValues.password}
            required
          />
          <button className="button" type="submit" disabled={!formValues.username || !formValues.password}>
            Login
          </button>
          <br />
          {/* <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div> */}
          <br />
          <p style={{ textAlign: 'center' }}>
            Don&apos;t have an account? <Link to="/register">Register Here</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
