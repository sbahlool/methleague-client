import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPredictionByUserAndMatch, PredictionResponse, updatePrediction } from '../services/Prediction'
import '../style/schedule.css' // Use the same CSS as the Schedule page
import { UserResponse } from '../services/Auth'

interface Props {
  currentUser: (UserResponse & { id: string }) | null // TODO: added the `& { id: string }` part as a quick hack because there's only a `._id` field to `UserResponse`... Up to you what you wanna do with this
}

const UpdatePrediction = ({ currentUser }: Props) => {
  const { matchId } = useParams()
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [homeScore, setHomeScore] = useState<string>('')
  const [awayScore, setAwayScore] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const predictionData = await getPredictionByUserAndMatch(currentUser!.id, matchId!)
        setPrediction(predictionData)
        setHomeScore(predictionData.predictedHomeScore.toString())
        setAwayScore(predictionData.predictedAwayScore.toString())
      } catch (error) {
        console.error('Failed to fetch prediction:', error)
      }
    }

    if (currentUser) {
      fetchPrediction()
    }
  }, [currentUser, matchId])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      const updatedPrediction = {
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
      }
      await updatePrediction(prediction!._id, updatedPrediction)
      navigate('/schedule') // Navigate back to the schedule or any other page after updating
    } catch (error) {
      console.error('Failed to update prediction:', error)
    }
  }

  if (!prediction) {
    return <div className="update-loading">Loading...</div>
  }

  return (
    <div className="schedule-container">
      {' '}
      {/* Reused container class */}
      <h2 className="update-header">Update Prediction</h2>
      <p className="update-gameweek">GW: {prediction.match.gameweek}</p>
      <div className="match">
        <div className="match-header">
          <div className="match-status">{prediction.match.isCompleted ? 'Completed' : 'Upcoming'}</div>
          <div className="match-tournament">
            <img src="/uploads/epl-logo.png" alt="League logo" />
            Premier League
          </div>
        </div>
        <div className="match-content">
          <div className="column">
            <div className="team team--home">
              <div className="team-logo">
                <img
                  src={`/uploads/${prediction.match.homeTeam.logo}`}
                  alt={`${prediction.match.homeTeam.teamname} logo`}
                />
              </div>
              <h2 className="team-name">{prediction.match.homeTeam.teamname}</h2>
            </div>
          </div>
          <div className="column">
            <div className="match-details">
              <div className="match-score">
                <span className="match-score-number match-score-number--leading">{homeScore}</span>
                <span className="match-score-divider">:</span>
                <span className="match-score-number">{awayScore}</span>
              </div>
              <form onSubmit={handleSubmit} className="update-form">
                <div className="update-score-input">
                  <label>
                    Home Team Score:
                    <input type="number" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} required />
                  </label>
                </div>
                <div className="update-score-input">
                  <label>
                    Away Team Score:
                    <input type="number" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} required />
                  </label>
                </div>
                <button type="submit" className="predict-button">
                  {' '}
                  {/* Reused button class */}
                  Update Prediction
                </button>
              </form>
            </div>
          </div>
          <div className="column">
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
        </div>
      </div>
    </div>
  )
}

export default UpdatePrediction
