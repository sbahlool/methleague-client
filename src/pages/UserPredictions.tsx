import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUserPredictions } from '../services/Prediction'
import '../style/userPredictions.css'

const UserPredictions = () => {
  const { userId } = useParams()
  const [predictions, setPredictions] = useState([])

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await getUserPredictions(userId)
        console.log('Fetched Predictions:', data) // Debugging
        if (data && Array.isArray(data)) {
          setPredictions(data)
        } else {
          console.error('Unexpected data format:', data)
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error)
      }
    }

    fetchPredictions()
  }, [userId])

  if (!predictions.length) {
    return <div className="no-predictions">No predictions found.</div>
  }

  return (
    <div className="user-predictions-container">
      <h2>User Predictions</h2>
      {predictions.map((prediction) => (
        <div key={prediction._id} className="user-predictions">
          <div className="match-headers">
            <div className="match-tournaments">
              <img src="/uploads/epl-logo.png" alt="League logo" />
              Premier League
            </div>
          </div>
          <div className="match-contents">
            <div className="columns">
              <div className="team team--home">
                <div className="team-logo">
                  <img
                    src={`/uploads/${prediction.match.homeTeam.logo}`}
                    alt={`${prediction.match.homeTeam.teamname} logo`}
                  />
                </div>
                <h2 className="team-name">
                  {prediction.match.homeTeam.teamname}
                </h2>
              </div>
            </div>
            <div className="column">
              <div className="match-details">
                <div className="match-date">
                  GW: {prediction.match.gameweek}
                </div>
                <div className="match-score">
                  <span className="match-score-number match-score-number--leading">
                    {prediction.predictedHomeScore}
                  </span>
                  <span className="match-score-divider">:</span>
                  <span className="match-score-number">
                    {prediction.predictedAwayScore}
                  </span>
                </div>
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
                <h2 className="team-name">
                  {prediction.match.awayTeam.teamname}
                </h2>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UserPredictions
