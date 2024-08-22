import { useState, useEffect } from 'react'
import { viewProfile } from '../services/Auth'
import { Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import '../style/profile.css' // Ensure this import is correct

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null)
  const { username } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleProfile = async () => {
      try {
        const fetchProfile = await viewProfile(username)
        setProfile(fetchProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    handleProfile()
  }, [username])

  const handleViewPredictions = async () => {
    navigate(`/user/${profile._id}/predictions`)
  }

  let editOptions = user && user.username === username && (
    <div>
      <a className="btn btn-outline-warning" href={`/profile/edit/${username}`}>
        Edit Profile
      </a>
      <a className="btn btn-outline-warning" href={`/profile/security/${username}`}>
        Change Password
      </a>
    </div>
  )

  return profile ? (
    <section className="vh-100 profile">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-md-12 col-xl-4">
            <div className="card">
              <div className="card-body text-center">
                <div className="mt-3 mb-4">
                  <div className="profile-pic">
                    <img src={`/uploads/${profile.profilePicture}`} id="output" alt="Profile" />
                  </div>
                </div>
                <h4 className="mb-2">
                  {profile.firstname} {profile.lastname}
                </h4>
                <p className="text-muted mb-4">@{profile.username}</p>
                {profile.team && (
                  <div className="team-logo-container">
                    <p className="text-muted mb-4">Favorite Team:</p>
                    <p>
                      <strong>{profile.team.teamname}</strong>
                    </p>
                    {profile.team.logo && (
                      <img src={`/uploads/${profile.team.logo}`} alt={`${profile.team.teamname} logo`} />
                    )}
                  </div>
                )}
                <button onClick={handleViewPredictions}>View Predicted Scores</button>
              </div>
              {username === profile.username && editOptions}
            </div>
          </div>
        </div>
      </div>
    </section>
  ) : (
    <div className="hero-section">
      <h1>Oops!</h1>
      <h3>Profile Not Found.</h3>
      <Link to="/">Go back to Home</Link>
    </div>
  )
}

export default Profile
