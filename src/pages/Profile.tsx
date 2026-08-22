import { useState, useEffect } from 'react'
import { getProfile, GetUsers, UserResponse } from '../services/Auth'
import { getUserPredictions, getPredictions, PredictionResponse } from '../services/Prediction'
import { Link, useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { getProfilePictureUrl } from '../utils/image'
import '../style/profile.css'

interface Props {
  user: UserResponse | null
}

const Profile = ({ user }: Props) => {
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [rank, setRank] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { username } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const handleProfile = async () => {
      setIsLoading(true)
      setProfile(null)
      try {
        setProfile(await getProfile(username!))
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    handleProfile()
  }, [username])

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?._id) return
      try {
        const data = await getUserPredictions(profile._id)
        setPredictions(data)
      } catch (error) {
        console.error('Error fetching prediction stats:', error)
      }
    }
    fetchStats()
  }, [profile?._id])

  useEffect(() => {
    const fetchRank = async () => {
      if (!profile?._id) return
      try {
        const [usersData, allPredictions] = await Promise.all([GetUsers(), getPredictions()])

        const pointsMap = allPredictions.reduce((acc: Record<string, number>, prediction: PredictionResponse) => {
          // A prediction's user can come back null if that user was
          // deleted after the prediction was made — populate() just
          // returns null rather than erroring, so skip these instead
          // of crashing on .user._id.
          if (!prediction.user) return acc

          const userId = prediction.user._id
          acc[userId] = (acc[userId] || 0) + prediction.points
          return acc
        }, {})

        const sortedUsers = [...usersData].sort((a, b) => (pointsMap[b._id] || 0) - (pointsMap[a._id] || 0))
        const position = sortedUsers.findIndex((u) => u._id === profile._id)
        setRank(position >= 0 ? position + 1 : null)
      } catch (error) {
        console.error('Error fetching rank:', error)
      }
    }
    fetchRank()
  }, [profile?._id])

  const handleViewPredictions = async () => {
    navigate(`/user/${profile?._id}/predictions`)
  }

  const submittedPredictions = predictions.filter((p) => p.predictedHomeScore !== null)
  const totalPoints = submittedPredictions.reduce((sum, p) => sum + (p.points || 0), 0)
  const perfectCount = submittedPredictions.filter((p) => p.points === 3).length

  const editOptions = user && user.username === username && (
    <div className="profile-edit-actions">
      <Link className="btn-ghost-pill" to={`/profile/edit/${username}`}>
        Edit Profile
      </Link>
      <Link className="btn-ghost-pill" to={`/profile/security/${username}`}>
        Change Password
      </Link>
    </div>
  )

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-loading-state">Loading profile…</div>
      </section>
    )
  }

  return profile ? (
    <section className="profile-page">
      <div className="profile-shell">
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            <img className="profile-avatar" src={getProfilePictureUrl(profile.profilePicture)} alt="Profile" />
          </div>

          <h4 className="profile-name">
            {profile.firstname} {profile.lastname}
          </h4>
          <p className="profile-username">@{profile.username}</p>

          {profile.team && (
            <div className="team-badge">
              {profile.team.logo && (
                <img className="team-badge-logo" src={`/uploads/${profile.team.logo}`} alt={`${profile.team.teamname} logo`} />
              )}
              <span className="team-badge-name">{profile.team.teamname}</span>
            </div>
          )}

          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-number">{rank ? `#${rank}` : '-'}</div>
              <div className="stat-label">Rank</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{totalPoints}</div>
              <div className="stat-label">Points</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{perfectCount}</div>
              <div className="stat-label">Perfect</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{submittedPredictions.length}</div>
              <div className="stat-label">Predictions</div>
            </div>
            {profile.MatchHighScore !== undefined && profile.MatchHighScore > 0 && (
              <div className="stat-box">
                <div className="stat-number">{profile.MatchHighScore}</div>
                <div className="stat-label">Best Turns</div>
              </div>
            )}
          </div>

          {user && user.username === username && (
            <button className="profile-cta" onClick={handleViewPredictions}>
              View Predicted Scores
            </button>
          )}

          {username === profile.username && editOptions}
        </div>
      </div>
    </section>
  ) : (
    <section className="profile-not-found">
      <h1>Oops!</h1>
      <h3>Profile Not Found.</h3>
      <Link to="/">Go back to Home</Link>
    </section>
  )
}

export default Profile
