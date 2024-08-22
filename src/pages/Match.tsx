import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMatchById } from '../services/Match'
import { addPrediction, getUserPrediction } from '../services/Prediction'
import { checkSession } from '../services/Auth'
import '../style/match.css'

const Match = () => {
  const { matchId } = useParams()
  const [match, setMatch] = useState(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [userId, setUserId] = useState(null)
  const [userPrediction, setUserPrediction] = useState(null)

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const data = await getMatchById(matchId)
        setMatch(data)
      } catch (error) {
        console.error('Failed to fetch match:', error)
      }
    }

    const fetchUserId = async () => {
      try {
        const sessionData = await checkSession()
        setUserId(sessionData.id)
      } catch (error) {
        console.error('Failed to fetch user ID:', error)
      }
    }

    fetchMatch()
    fetchUserId()
  }, [matchId])

  useEffect(() => {
    const fetchUserPrediction = async () => {
      if (userId) {
        try {
          const prediction = await getUserPrediction(matchId, userId)
          if (prediction) {
            setUserPrediction(prediction)
            setHomeScore(prediction.predictedHomeScore?.toString() || '')
            setAwayScore(prediction.predictedAwayScore?.toString() || '')
          } else {
            setUserPrediction(null)
            setHomeScore('')
            setAwayScore('')
          }
        } catch (error) {
          console.error('Failed to fetch user prediction:', error)
        }
      }
    }

    fetchUserPrediction()
  }, [userId, matchId])

  const handlePredictionSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!userId) {
        alert('User not logged in.')
        return
      }
      const predictionData = {
        match: matchId,
        user: userId,
        predictedHomeScore: parseInt(homeScore),
        predictedAwayScore: parseInt(awayScore),
      }
      const prediction = await addPrediction(predictionData)
      setUserPrediction(prediction)
      alert('Prediction submitted successfully!')
    } catch (error) {
      console.error('Failed to submit prediction:', error)
      alert('Failed to submit prediction.')
    }
  }

  if (!match) {
    return <div>Loading...</div>
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
      'December',
    ]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  return (
    <div className="match-container">
      <h2 className="match-title">Match Details</h2>
      <h3 className="match-header">
        <img
          className="team-logo"
          src={`/uploads/${match.homeTeam.logo}`}
          alt={`${match.homeTeam.teamname} logo`}
          width="80"
        />{' '}
        {match.homeTeam.teamname}{' '}
        {userPrediction ? (
          <span className="match-score">
            {match.homeScore} : {match.awayScore}
          </span>
        ) : (
          <span className="match-vs">vs</span>
        )}{' '}
        {match.awayTeam.teamname}
        <img
          className="team-logo"
          src={`/uploads/${match.awayTeam.logo}`}
          alt={`${match.awayTeam.teamname} logo`}
          width="80"
        />
      </h3>
      <p className="match-details">
        Date: {formatDate(match.date)} <br /> Time: {match.time}
      </p>

      {!userPrediction ? (
        <form className="prediction-form" onSubmit={handlePredictionSubmit}>
          <div className="prediction-inputs-container">
            <div className="prediction-input">
              <label className="prediction-label">Home Team Score:</label>
              <input
                className="prediction-score"
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                required
              />
            </div>
            <div className="prediction-input">
              <label className="prediction-label">Away Team Score:</label>
              <input
                className="prediction-score"
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="prediction-submit-container">
            <button className="prediction-submit" type="submit">
              Submit Prediction
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="user-prediction">
            <p>Your Prediction:</p>
            <p className="user-prediction-score">
              {userPrediction.predictedHomeScore} : {userPrediction.predictedAwayScore}
            </p>
          </div>
          <div className="update-prediction-container">
            <button className="update-prediction-button" onClick={() => setUserPrediction(null)}>
              Update Prediction
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Match
