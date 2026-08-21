import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllPredictionsByGameweek, PredictionResponse } from '../services/Prediction'
import { getMatches, MatchResponse } from '../services/Match'
import { GetUsers, UserResponse } from '../services/Auth'
import '../style/schedule.css'
import '../style/adminPrediction.css'
import { formatDate } from '../utils/date'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Props {
  user: UserResponse | null
}

const AdminPredictions = ({ user }: Props) => {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [addedMatches, setAddedMatches] = useState<MatchResponse[]>([])
  const [options, setOptions] = useState<number[]>([])
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1)
  const [users, setUsers] = useState<UserResponse[]>([])
  const [showMatchPredictions, setShowMatchPredictions] = useState<{ [key: string]: boolean }>({})

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const selectedTabRef = useRef<HTMLLabelElement | null>(null)

  useEffect(() => {
    const fetchAddedMatches = async () => {
      try {
        const matches = await getMatches()
        setAddedMatches(matches)
        const uniqueGameweeks = [...new Set(matches.map((match) => match.gameweek))]

        uniqueGameweeks.sort((a, b) => a - b)
        setOptions(uniqueGameweeks)

        // Set the default selected gameweek to the first not completed gameweek
        const firstNotCompletedGameweek = uniqueGameweeks
          .filter((gw) => !matches.find((match) => match.gameweek === gw && match.isCompleted))
          .sort((a, b) => a - b)[0] // Get the first gameweek
        if (firstNotCompletedGameweek) {
          setSelectedGameweek(firstNotCompletedGameweek)
        }
      } catch (error) {
        console.error('Failed to fetch added matches', error)
      }
    }

    fetchAddedMatches()
  }, [])

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await getAllPredictionsByGameweek(selectedGameweek)
        // A prediction's user can come back null if that user was deleted
        // after the prediction was made — populate() just returns null
        // rather than erroring, so drop these instead of crashing later
        // on prediction.user._id / prediction.user.username.
        setPredictions(data.filter((prediction) => prediction.user))
      } catch (error) {
        console.error('Error fetching predictions:', error)
      }
    }

    const fetchUsers = async () => {
      try {
        const userList = await GetUsers()
        setUsers(userList)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    if (user?.role === 'admin') {
      fetchPredictions()
      fetchUsers()
    }
  }, [selectedGameweek, user])

  // Keep the active gameweek tab centered in view whenever it changes.
  useEffect(() => {
    selectedTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedGameweek, options])

  const scrollGameweeks = (direction: 1 | -1) => {
    scrollContainerRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }

  const handleGameweekChange = (gameweek: number) => {
    setSelectedGameweek(gameweek)
  }

  const toggleMatchPredictions = (matchId: string) => {
    setShowMatchPredictions((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }))
  }

  if (user?.role !== 'admin') {
    return <div className="admin-predictions-denied">You do not have permission to view this page.</div>
  }

  return (
    <div className="admin-predictions-container">
      <h2>Admin Predictions</h2>

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
          {options.map((gameweek) => (
            <label
              key={gameweek}
              className="gameweek-option"
              ref={selectedGameweek === gameweek ? selectedTabRef : null}
            >
              <input
                type="radio"
                value={gameweek}
                checked={selectedGameweek === gameweek}
                onChange={() => handleGameweekChange(gameweek)}
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

      <div className="matches-list">
        {addedMatches
          .filter((match) => match.gameweek === selectedGameweek)
          .map((match) => {
            const matchPredictions = predictions.filter(
              (prediction) => prediction.match._id === match._id && prediction.predictedHomeScore !== null,
            )
            const usersWithoutPrediction = users.filter(
              (u) =>
                !predictions.some(
                  (prediction) =>
                    prediction.match._id === match._id &&
                    prediction.user._id === u._id &&
                    prediction.predictedHomeScore !== null,
                ),
            )
            const isExpanded = showMatchPredictions[match._id]
            const submittedCount = matchPredictions.length
            const totalCount = users.length

            return (
              <div key={match._id} className={`match ${match.isCompleted ? 'match--completed' : ''}`}>
                <div className="match-header">
                  <div className={`match-status ${match.isCompleted ? 'is-completed' : 'is-upcoming'}`}>
                    {match.isCompleted ? 'Completed' : 'Upcoming'}
                  </div>
                  <div className="match-date-time">
                    {formatDate(match.date)} {match.time}
                  </div>
                  <img className="match-tournament" src="/uploads/epl-logo.png" alt="Premier League" />
                </div>
                <div className="match-content">
                  <div className="team team--home">
                    <img
                      className="team-logo"
                      src={`/uploads/${match.homeTeam.logo}`}
                      alt={`${match.homeTeam.teamname} logo`}
                    />
                    <div className="team-name">{match.homeTeam.teamname}</div>
                  </div>
                  <div className="match-score">
                    <span className="match-score-number">{match.isCompleted ? match.homeScore : '-'}</span>
                    <span className="match-score-divider">:</span>
                    <span className="match-score-number">{match.isCompleted ? match.awayScore : '-'}</span>
                  </div>
                  <div className="team team--away">
                    <img
                      className="team-logo"
                      src={`/uploads/${match.awayTeam.logo}`}
                      alt={`${match.awayTeam.teamname} logo`}
                    />
                    <div className="team-name">{match.awayTeam.teamname}</div>
                  </div>
                </div>

                <div className="predictions-toolbar">
                  <div className="submission-progress">
                    <div className="submission-bar">
                      <div
                        className="submission-bar-fill"
                        style={{ width: totalCount ? `${(submittedCount / totalCount) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="submission-count">
                      {submittedCount}/{totalCount} submitted
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-predictions ${isExpanded ? 'active' : ''}`}
                    onClick={() => toggleMatchPredictions(match._id)}
                  >
                    {isExpanded ? 'Hide Predictions' : 'Show Predictions'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="predictions-panel">
                    {matchPredictions.length > 0 ? (
                      <div className="prediction-rows">
                        {matchPredictions.map((prediction) => (
                          <div key={prediction._id} className="prediction-row">
                            <Link to={`/profile/${prediction.user.username}`} className="prediction-user">
                              {prediction.user.username}
                            </Link>
                            <span className="prediction-score">
                              {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                            </span>
                            <span
                              className={`prediction-points ${
                                prediction.points === 3
                                  ? 'prediction-points--perfect'
                                  : prediction.points > 0
                                  ? 'prediction-points--correct'
                                  : 'prediction-points--zero'
                              }`}
                            >
                              {prediction.points === 3 ? 'Perfect' : `${prediction.points} pt${prediction.points === 1 ? '' : 's'}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="predictions-empty">No predictions submitted yet.</p>
                    )}

                    {usersWithoutPrediction.length > 0 && (
                      <div className="no-prediction-rows">
                        {usersWithoutPrediction.map((u) => (
                          <div key={u._id} className="no-prediction-row">
                            <Link to={`/profile/${u.username}`} className="prediction-user">
                              {u.username}
                            </Link>
                            <span className="no-prediction-tag">No prediction</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default AdminPredictions
