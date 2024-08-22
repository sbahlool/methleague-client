import { useState, useEffect } from 'react'
import { registerUser, loginUser, getTeams } from '../services/Auth'
import { useNavigate, Link } from 'react-router-dom'
import '../style/auth.css'

const Register = ({ setUser }) => {
  let navigate = useNavigate()

  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    team: '',
  })
  const [teams, setTeams] = useState([])

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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    await registerUser({
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
      confirmPassword: formValues.confirmPassword,
      firstname: formValues.firstname,
      lastname: formValues.lastname,
      team: formValues.team,
    })
    setFormValues({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstname: '',
      lastname: '',
      team: '',
    })

    const payload = await loginUser(formValues)
    setUser(payload)
    navigate('/')
  }

  return (
    <div className="container" style={{ padding: '50px 0 50px 0' }}>
      <h1 style={{ textAlign: 'center' }}>Create a new account</h1>
      <br />
      <div>
        <div>
          <form className="form" onSubmit={handleSubmit}>
            <label className="label" htmlFor="email">
              Email:
            </label>
            <input
              onChange={handleChange}
              name="email"
              className="input"
              type="email"
              value={formValues.email}
              required
            />
            <label className="label" htmlFor="password">
              Password:
            </label>
            <input
              onChange={handleChange}
              name="password"
              className="input"
              type="password"
              value={formValues.password}
              required
            />
            <label className="label" htmlFor="confirmPassword">
              Confirm Password:
            </label>
            <input
              onChange={handleChange}
              name="confirmPassword"
              className="input"
              type="password"
              value={formValues.confirmPassword}
              required
            />
            <label className="label" htmlFor="username">
              Username:
            </label>
            <input
              onChange={handleChange}
              name="username"
              className="input"
              type="text"
              value={formValues.username}
              required
            />
            <label className="label" htmlFor="firstname">
              First Name:
            </label>
            <input
              onChange={handleChange}
              name="firstname"
              className="input"
              type="text"
              value={formValues.firstname}
              required
            />
            <label className="label" htmlFor="lastname">
              Last Name:
            </label>
            <input
              onChange={handleChange}
              name="lastname"
              className="input"
              type="text"
              value={formValues.lastname}
              required
            />
            <label className="label" htmlFor="team">
              Favorite Team:
            </label>
            <select name="team" className="input" value={formValues.team} onChange={handleChange} required>
              <option value="">Select your favorite team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>
                  {team.teamname}
                </option>
              ))}
            </select>
            <button className="button" type="submit" disabled={!formValues.username || !formValues.password}>
              Register
            </button>
            <br />
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
