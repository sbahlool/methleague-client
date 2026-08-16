import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getUserPredictions, PredictionResponse } from '../services/Prediction'
import { GetUserById, UserResponse } from '../services/Auth'
import { getProfilePictureUrl } from '../utils/image'
import '../style/schedule.css'
import '../style/adminPrediction.css'
import '../style/userPredictions.css'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Props {
  currentUser: UserResponse | null
}

const UserPredictions = ({ currentUser }: Props) => {
  const { userId } = useParams()
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null)

  // The logged-in user's `_id` isn't always actually populated at runtime —
  // login/session responses carry the JWT payload shape ({ id, username,
  // role }), not the full UserResponse, despite being typed as one. Check
  // both fields so this works regardless of which shape is actually present.
  const currentUserId = (currentUser as unknown as { id?: string; _id?: string } | null)?._id ??
    (currentUser as unknown as { id?: string; _id?: string } | null)?.id
  const isOwner = !!currentUserId && currentUserId === userId

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const selectedTabRef = useRef<HTMLLabelElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !isOwner) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError('')

      try {
        const [predictionsData, profileData] = await Promise.all([getUserPredictions(userId), GetUserById(userId)])

        if (Array.isArray(predictionsData)) {
          setPredictions(predictionsData)

          const gameweeks = [...new Set(predictionsData.map((p) => p.match?.gameweek).filter((gw) => gw != null))].sort(
            (a, b) => a - b,
          )
          // Default to the most recent gameweek with a prediction, since
          // that's the one you most likely came here to check.
          if (gameweeks.length > 0) setSelectedGameweek(gameweeks[gameweeks.length - 1])
        } else {
          console.error('Unexpected predictions format:', predictionsData)
          setPredictions([])
        }
        setProfile(profileData)
      } catch (err) {
        console.error('Failed to fetch predictions:', err)
        setError('Something went wrong loading these predictions. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, isOwner])

  // Keep the active gameweek tab centered in view whenever it changes.
  useEffect(() => {
    selectedTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedGameweek])

  const scrollGameweeks = (direction: 1 | -1) => {
    scrollContainerRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }

  const pointsLabel = (points: number) => {
    if (points === 3) return 'Perfect'
    return `${points} pt${points === 1 ? '' : 's'}`
  }

  const pointsClass = (points: number) => {
    if (points === 3) return 'prediction-points--perfect'
    if (points > 0) return 'prediction-points--correct'
    return 'prediction-points--zero'
  }

  const availableGameweeks = [...new Set(predictions.map((p) => p.match?.gameweek).filter((gw) => gw != null))].sort(
    (a, b) => a - b,
  )
  const visiblePredictions = predictions.filter((p) => p.match?.gameweek === selectedGameweek)

  if (!isOwner) {
    return (
      <div className="user-predictions-page">
        <div className="up-state up-state--error">
          You can only view your own predictions.
          <br />
          <Link to="/" className="up-restricted-link">
            Go back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="user-predictions-page">
      <div className="user-predictions-header">
        {profile && (
          <Link to={`/profile/${profile.username}`} className="up-profile-chip">
            <img className="up-profile-avatar" src={getProfilePictureUrl(profile.profilePicture)} alt={profile.username} />
            <span>@{profile.username}</span>
          </Link>
        )}
        <h2 className="up-title">Predictions</h2>
      </div>

      {isLoading && <div className="up-state">Loading predictions…</div>}

      {!isLoading && error && <div className="up-state up-state--error">{error}</div>}

      {!isLoading && !error && predictions.length === 0 && (
        <div className="up-state">No predictions submitted yet.</div>
      )}

      {!isLoading && !error && predictions.length > 0 && (
        <>
          <div className="gameweek-carousel">
            <button
              type="button"
              className="carousel-arrow"
              onClick={() => scrollGameweeks(-1)}
              aria-label="Scroll to earlier gameweeks"
            >
              <FaChevronLeft />
            </button>
            <div className="gameweek-options" ref={scrollContainerRef}>
              {availableGameweeks.map((gameweek) => (
                <label
                  key={gameweek}
                  className="gameweek-option"
                  ref={selectedGameweek === gameweek ? selectedTabRef : null}
                >
                  <input
                    type="radio"
                    value={gameweek}
                    checked={selectedGameweek === gameweek}
                    onChange={() => setSelectedGameweek(gameweek)}
                  />
                  <span className="gameweek-label">{gameweek}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              className="carousel-arrow"
              onClick={() => scrollGameweeks(1)}
              aria-label="Scroll to later gameweeks"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="prediction-grid">
            {visiblePredictions.map((prediction) => {
              const match = prediction.match
              const isCompleted = match?.isCompleted
              const pointsEarned = prediction.points ?? 0

              return (
                <div key={prediction._id} className={`prediction-card ${isCompleted ? 'prediction-card--completed' : ''}`}>
                  <div className="prediction-card-header">
                    <span className={`match-status ${isCompleted ? 'is-completed' : 'is-upcoming'}`}>
                      {isCompleted ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>

                  <div className="prediction-card-teams">
                    <div className="prediction-card-team">
                      <img
                        className="prediction-card-logo"
                        src={`/uploads/${match?.homeTeam.logo}`}
                        alt={`${match?.homeTeam.teamname} logo`}
                      />
                      <span className="prediction-card-team-name">{match?.homeTeam.teamname}</span>
                    </div>

                    <div className="prediction-card-score">
                      {isCompleted ? `${match?.homeScore} - ${match?.awayScore}` : 'vs'}
                    </div>

                    <div className="prediction-card-team">
                      <img
                        className="prediction-card-logo"
                        src={`/uploads/${match?.awayTeam.logo}`}
                        alt={`${match?.awayTeam.teamname} logo`}
                      />
                      <span className="prediction-card-team-name">{match?.awayTeam.teamname}</span>
                    </div>
                  </div>

                  <div className="prediction-card-footer">
                    <span className="prediction-card-predicted">
                      {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                    </span>
                    {isCompleted && (
                      <span className={`prediction-points ${pointsClass(pointsEarned)}`}>
                        {pointsLabel(pointsEarned)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default UserPredictions
