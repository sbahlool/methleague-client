import { useState, useEffect } from 'react'
import { getAllPredictionsByGameweek, PredictionResponse } from '../services/Prediction'
import { getMatches, MatchResponse } from '../services/Match'
import '../style/adminPrediction.css' // Import the new CSS file
import { UserResponse } from '../services/Auth'
import { formatDate } from '../utils/date'

interface Props {
  user: UserResponse | null
}

const AdminPredictions = ({ user }: Props) => {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [addedMatches, setAddedMatches] = useState<MatchResponse[]>([])
  const [options, setOptions] = useState<number[]>([])
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1)

  useEffect(() => {
    const fetchAddedMatches = async () => {
      try {
        const matches = await getMatches()
        setAddedMatches(matches)
        const uniqueGameweeks = [...new Set(matches.map((match) => match.gameweek))]
        setOptions(uniqueGameweeks)
        setSelectedGameweek(uniqueGameweeks[0])
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
        setPredictions(data)
      } catch (error) {
        console.error('Error fetching predictions:', error)
      }
    }

    if (user?.role === 'admin') {
      fetchPredictions()
    }
  }, [selectedGameweek, user])

  const handleGameweekChange = (gameweek: number) => {
    setSelectedGameweek(gameweek)
  }

  if (user?.role !== 'admin') {
    return <div>You do not have permission to view this page.</div>
  }

  return (
    <div className="admin-predictions-container">
      <h2>Admin Predictions</h2>
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
          .map((match) => (
            <div key={match._id} className="match-card">
              <div className="match-header">
                <div className="team">
                  <div className="team-logo">
                    <img src={`/uploads/${match.homeTeam.logo}`} alt={`${match.homeTeam.teamname} logo`} />
                  </div>
                  <div className="team-name">{match.homeTeam.teamname}</div>
                </div>
                <div className="match-tournament">
                  {match.homeTeam.teamname} vs {match.awayTeam.teamname}
                </div>
                <div className="team">
                  <div className="team-logo">
                    <img src={`/uploads/${match.awayTeam.logo}`} alt={`${match.awayTeam.teamname} logo`} />
                  </div>
                  <div className="team-name">{match.awayTeam.teamname}</div>
                </div>
              </div>
              <div className="match-details">
                Date: {formatDate(match.date)} <br /> Time: {match.time}
              </div>
              {predictions
                .filter((prediction) => prediction.match._id === match._id)
                .map((prediction) => (
                  <div key={prediction._id} className="user-prediction">
                    <h4>{prediction.user.username}</h4>
                    <p>
                      Predicted Score: {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                    </p>
                    <p>Points: {prediction.points}</p>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  )
}

export default AdminPredictions
