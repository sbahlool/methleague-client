import { useState, useEffect, useRef } from 'react'
import { getProfile, editProfile, getTeams, TeamResponse, EditProfileRequest, UserResponse } from '../services/Auth'
import { useNavigate, useParams } from 'react-router-dom'
import { getProfilePictureUrl } from '../utils/image'
import '../style/auth.css'
import '../style/editProfilePage.css'

const extractErrorMessage = (error: any): string => {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.error) return data.error
  if (data?.msg) return data.msg
  return 'Something went wrong. Please try again.'
}

interface Props {
  setUser: (user: UserResponse) => void
}

const EditProfilePage = ({ setUser }: Props) => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newProfile, setNewProfile] = useState<EditProfileRequest>({
    username: '',
    email: '',
    firstname: '',
    lastname: '',
    team: '',
  })
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [currentPicture, setCurrentPicture] = useState<string>('default.png')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  let { username } = useParams()
  if (!username) username = ''

  useEffect(() => {
    const fetchData = async () => {
      const profileData = await getProfile(username)
      const teamsData = await getTeams()
      setNewProfile({ ...profileData, team: profileData.team?._id || '' })
      setCurrentPicture(profileData.profilePicture || 'default.png')
      setTeams(teamsData)
    }
    fetchData()
  }, [username])

  // Revoke the object URL when it's replaced or the component unmounts,
  // otherwise each new preview leaks the previous blob.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }

    setError('')
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setNewProfile({ ...newProfile, [e.target.name as keyof EditProfileRequest]: e.target.value })
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('username', newProfile.username)
      formData.append('email', newProfile.email)
      formData.append('firstname', newProfile.firstname)
      formData.append('lastname', newProfile.lastname)
      formData.append('team', newProfile.team)
      if (selectedFile) formData.append('profilePicture', selectedFile)

      const response = await editProfile(username, formData)

      // Defensive: handle either the new { user, token } response shape,
      // or a bare user object if the deployed/running server hasn't picked
      // up the backend change yet — avoids a hard crash on a shape mismatch
      // either way, since the save itself has already succeeded by this point.
      const responseData = response as { user?: UserResponse; token?: string } & Partial<UserResponse>
      const updatedUser = (responseData.user ?? responseData) as UserResponse
      const token = responseData.token

      if (!updatedUser?.username) {
        throw new Error('Unexpected response from server after saving.')
      }

      if (token) localStorage.setItem('token', token)
      setUser(updatedUser)

      navigate(`/profile/${updatedUser.username}`)
    } catch (err) {
      setError(extractErrorMessage(err))
      setSubmitting(false)
    }
  }

  const displayedPicture = previewUrl || getProfilePictureUrl(currentPicture)
  const selectedTeam = teams.find((team) => team._id === newProfile.team)

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-shell">
        <h1 className="edit-profile-title">Edit My Profile</h1>

        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <div className="avatar-upload">
            <button
              type="button"
              className="avatar-upload-button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
            >
              <img className="avatar-upload-image" src={displayedPicture} alt="Profile" />
              <span className="avatar-upload-overlay">Change Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="avatar-upload-input"
              onChange={handleFileChange}
            />
            {selectedFile && <p className="avatar-upload-filename">{selectedFile.name}</p>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="auth-input"
              name="username"
              value={newProfile.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="auth-input"
              name="email"
              value={newProfile.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="firstname">
              First Name
            </label>
            <input
              id="firstname"
              type="text"
              className="auth-input"
              name="firstname"
              value={newProfile.firstname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="lastname">
              Last Name
            </label>
            <input
              id="lastname"
              type="text"
              className="auth-input"
              name="lastname"
              value={newProfile.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <p className="team-grid-label">Favorite Team</p>
            <div className="team-grid">
              {teams.map((team) => (
                <button
                  type="button"
                  key={team._id}
                  className={`team-card ${newProfile.team === team._id ? 'selected' : ''}`}
                  onClick={() => setNewProfile({ ...newProfile, team: team._id })}
                >
                  <img className="team-card-logo" src={`/uploads/${team.logo}`} alt={`${team.teamname} logo`} />
                  <span className="team-card-name">{team.teamname}</span>
                </button>
              ))}
            </div>
            {!selectedTeam && <span className="field-hint field-hint--bad">Please select a favorite team</span>}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit edit-profile-submit" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditProfilePage
