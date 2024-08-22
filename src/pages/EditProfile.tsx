import { useState, useEffect } from 'react'
import { getProfile, editProfile, getTeams, TeamResponse, UserResponse } from '../services/Auth'
import { useNavigate, useParams } from 'react-router-dom'
import '../style/editProfilePage.css'

const EditProfilePage = () => {
  let navigate = useNavigate()

  const [profile, setProfile] = useState<UserResponse>({
    _id: '',
    username: '',
    email: '',
    passwordDigest: '',
    firstname: '',
    lastname: '',
    profilePicture: '',
    team: { _id: '', teamname: '', logo: '', __v: 0 },
    role: '',
    createdAt: '',
    updatedAt: '',
    __v: 0,
  })
  const [newProfile, setNewProfile] = useState({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    team: '', // Add team field to state
  })
  const [teams, setTeams] = useState<TeamResponse[]>([])
  let { username } = useParams()
  if (!username) username = ''

  useEffect(() => {
    const fetchData = async () => {
      const profileData = await getProfile(username)
      const teamsData = await getTeams()
      setProfile(profileData)
      setNewProfile({ ...profileData, team: profileData.team._id }) // Set initial team value
      setTeams(teamsData)
    }
    fetchData()
  }, [username])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append('username', newProfile.username)
    formData.append('email', newProfile.email)
    formData.append('firstname', newProfile.firstname)
    formData.append('lastname', newProfile.lastname)
    formData.append('team', newProfile.team)

    await editProfile(username, formData)
    navigate(`/profile/${newProfile.username}`)
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setNewProfile({ ...newProfile, [e.target.name]: e.target.value })
  }

  return (
    <div className="edit-profile-container">
      <img src={`/uploads/${profile.profilePicture}`} id="output" className="edit-profile-image" alt="Profile" />

      <h1 className="edit-profile-title">Edit My Profile</h1>
      <br />
      <form className="edit-profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <label className="edit-profile-label" htmlFor="username">
          Username
        </label>
        <input
          type="text"
          className="edit-profile-input"
          name={'username'}
          placeholder={'Username'}
          value={newProfile.username}
          onChange={handleChange}
          required
        />

        <label className="edit-profile-label" htmlFor="email">
          Email
        </label>
        <input
          type="text"
          className="edit-profile-input"
          name={'email'}
          placeholder={'Email'}
          value={newProfile.email}
          onChange={handleChange}
          required
        />

        <label className="edit-profile-label" htmlFor="firstname">
          First Name
        </label>
        <input
          type="text"
          className="edit-profile-input"
          name={'firstname'}
          placeholder={'First Name'}
          value={newProfile.firstname}
          onChange={handleChange}
          required
        />

        <label className="edit-profile-label" htmlFor="lastname">
          Last Name
        </label>
        <input
          type="text"
          className="edit-profile-input"
          name={'lastname'}
          placeholder={'Last Name'}
          value={newProfile.lastname}
          onChange={handleChange}
          required
        />

        {/* Team Selection Input */}
        <label className="edit-profile-label" htmlFor="team">
          Favorite Team
        </label>
        <select name="team" className="edit-profile-input" value={newProfile.team} onChange={handleChange} required>
          <option value="">Select Team</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamname}
            </option>
          ))}
        </select>

        <br />
        <br />
        <button className="edit-profile-button" type="submit">
          Edit Profile
        </button>
      </form>
    </div>
  )
}

export default EditProfilePage
