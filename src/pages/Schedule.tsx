import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMatches } from '../services/Match'
import { getUserPredictions } from '../services/Prediction'
import '../style/schedule.css'

const Schedule = ({ currentUser }) => {
  const [addedMatches, setAddedMatches] = useState([])
  const [selectedGameweek, setSelectedGameweek] = useState(1)
  const [options, setOptions] = useState([])
  const [userPredictions, setUserPredictions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAddedMatches = async () => {
      try {
        const matches = await getMatches()
        setAddedMatches(matches)
        const uniqueGameweeks = [
          ...new Set(matches.map((match) => match.gameweek))
        ]
        setOptions(uniqueGameweeks)
      } catch (error) {
        console.error('Failed to fetch added matches', error)
      }
    }

    fetchAddedMatches()
  }, [])

  useEffect(() => {
    const fetchUserPredictions = async () => {
      if (!currentUser) return

      try {
        const userPredictions = await getUserPredictions(currentUser.id)
        setUserPredictions(userPredictions)
      } catch (error) {
        console.error('Failed to fetch user predictions:', error)
      }
    }

    fetchUserPredictions()
  }, [selectedGameweek, currentUser])

  const handleGameweekChange = (gameweek) => {
    setSelectedGameweek(gameweek)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  const getTimeDiff = (match) => {
    const matchDate = new Date(match.date)
    const matchDateTime = new Date(
      `${matchDate.toISOString().split('T')[0]}T${match.time}:00`
    )
    const currentTime = new Date()
    return (matchDateTime - currentTime) / (1000 * 60) // time difference in minutes
  }

  const handlePredictClick = (match) => {
    const predictionExists = getUserPredictionForMatch(match._id)
    const timeDiff = getTimeDiff(match)

    if (timeDiff <= 10) {
      alert(
        'You cannot add or update predictions within 10 minutes of the match time.'
      )
      return
    }

    if (predictionExists) {
      navigate(`/update-prediction/${match._id}`)
    } else {
      navigate(`/match/${match._id}`)
    }
  }

  const getUserPredictionForMatch = (matchId) =>
    userPredictions.find((prediction) => prediction.match._id === matchId)

  return (
    <div className="schedule-container">
      <h2>Schedule</h2>
      <div className="gameweek-options">
        {options.map((gameweek) => (
          <label key={gameweek} className="gameweek-option">
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
      <div className="matches-list">
        {addedMatches
          .filter((match) => match.gameweek === selectedGameweek)
          .map((match) => {
            const timeDiff = getTimeDiff(match)
            const isRestricted = timeDiff <= 10
            const userPrediction = getUserPredictionForMatch(match._id)

            return (
              <div key={match._id} className="match">
                <div className="match-header">
                  <div className="match-status">
                    {match.isCompleted ? 'Completed' : 'Upcoming'}
                  </div>
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
                          src={`/uploads/${match.homeTeam.logo}`}
                          alt={`${match.homeTeam.teamname} logo`}
                        />
                      </div>
                      <h2 className="team-name">{match.homeTeam.teamname}</h2>
                    </div>
                  </div>
                  <div className="column">
                    <div className="match-details">
                      <div className="match-date">
                        {formatDate(match.date)} at{' '}
                        <strong>{match.time}</strong>
                      </div>
                      <div className="match-score">
                        <span className="match-score-number match-score-number--leading">
                          {match.isCompleted ? match.homeScore : '-'}
                        </span>
                        <span className="match-score-divider">:</span>
                        <span className="match-score-number">
                          {match.isCompleted ? match.awayScore : '-'}
                        </span>
                      </div>
                      {isRestricted && (
                        <div className="match-restriction">
                          Predictions not allowed within 10 minutes of the
                          match.
                        </div>
                      )}
                      {!match.isCompleted && (
                        <button
                          className="predict-button"
                          onClick={() => handlePredictClick(match)}
                          disabled={isRestricted}
                        >
                          {userPrediction
                            ? `Update Prediction: ${userPrediction.predictedHomeScore}-${userPrediction.predictedAwayScore}`
                            : 'Predict Score'}
                        </button>
                      )}
                      {userPrediction && match.isCompleted && (
                        <div className="user-prediction">
                          Your prediction: {userPrediction.predictedHomeScore} -{' '}
                          {userPrediction.predictedAwayScore}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="column">
                    <div className="team team--away">
                      <div className="team-logo">
                        <img
                          src={`/uploads/${match.awayTeam.logo}`}
                          alt={`${match.awayTeam.teamname} logo`}
                        />
                      </div>
                      <h2 className="team-name">{match.awayTeam.teamname}</h2>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default Schedule
