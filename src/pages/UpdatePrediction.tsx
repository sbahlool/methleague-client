import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPredictionByUserAndMatch, PredictionResponse, updatePrediction } from '../services/Prediction'
import '../style/schedule.css' // Use the same CSS as the Schedule page
import { UserResponse } from '../services/Auth'
import '../style/schedule.css'

interface Props {
  currentUser: (UserResponse & { id?: string }) | null // TODO: added the `& { id: string }` part as a quick hack because there's only a `._id` field to `UserResponse`... Up to you what you wanna do with this
}

const UpdatePrediction = ({ currentUser }: Props) => {
  const { matchId } = useParams()
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [homeScore, setHomeScore] = useState<string>('')
  const [awayScore, setAwayScore] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const predictionData = await getPredictionByUserAndMatch(currentUser!.id, matchId!)
        setPrediction(predictionData)
        setHomeScore(predictionData.predictedHomeScore.toString())
        setAwayScore(predictionData.predictedAwayScore.toString())
      } catch (err) {
        console.error('Failed to fetch prediction:', err)
        setError('Failed to load prediction. Please try again.')
      }
    }

    if (currentUser) {
      fetchPrediction()
    }
  }, [currentUser, matchId])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError(null)
    if (parseInt(homeScore) < 0 || parseInt(awayScore) < 0) {
      setError('Scores must be non-negative integers.')
      return
    }
    try {
      const updatedPrediction = {
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
      }
      await updatePrediction(prediction!._id, updatedPrediction)
      navigate('/schedule')
    } catch (error) {
      console.error('Failed to update prediction:', error)
      setError('Failed to update prediction. Please try again.')
    }
  }

  if (!prediction) {
    return (
      <div className="update-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="schedule-container">
      <h2 className="update-header">Update Prediction</h2>
      <p className="update-gameweek">GW: {prediction.match.gameweek}</p>
      <div className="match">
        <div className="match-header">
          <div className="match-status">{prediction.match.isCompleted ? 'Completed' : 'Upcoming'}</div>
          <div className="match-date-time">
            {new Date(prediction.match.date).toLocaleDateString()} {prediction.match.time}
          </div>
          <div className="match-tournament">
            <img src="/uploads/epl-logo.png" alt="Premier League" />
          </div>
        </div>
        <div className="match-content">
          <div className="team team--home">
            <div className="team-logo">
              <img
                src={`/uploads/${prediction.match.homeTeam.logo}`}
                alt={`${prediction.match.homeTeam.teamname} logo`}
              />
            </div>
            <h2 className="team-name">{prediction.match.homeTeam.teamname}</h2>
          </div>
          <div className="match-score">
            <span className="match-score-number match-score-number--leading">
              {prediction.match.isCompleted ? prediction.match.homeScore : '-'}
            </span>
            <span className="match-score-divider">:</span>
            <span className="match-score-number">
              {prediction.match.isCompleted ? prediction.match.awayScore : '-'}
            </span>
          </div>
          <div className="team team--away">
            <div className="team-logo">
              <img
                src={`/uploads/${prediction.match.awayTeam.logo}`}
                alt={`${prediction.match.awayTeam.teamname} logo`}
              />
            </div>
            <h2 className="team-name">{prediction.match.awayTeam.teamname}</h2>
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="update-form">
          <div className="update-score-inputs">
            <div className="update-score-input">
              <label htmlFor="homeScore">Home:</label>
              <input
                id="homeScore"
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                required
                min="0"
                aria-label="Home team score"
              />
            </div>
            <div className="update-score-input">
              <label htmlFor="awayScore">Away:</label>
              <input
                id="awayScore"
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                required
                min="0"
                aria-label="Away team score"
              />
            </div>
          </div>
          <button type="submit" className="toggle-predictions predict-button">
            Update Prediction
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdatePrediction
