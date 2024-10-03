import { useState, useEffect } from 'react'
import { getAllPredictionsByGameweek, PredictionResponse } from '../services/Prediction'
import { getMatches, MatchResponse } from '../services/Match'
import { GetUsers, UserResponse } from '../services/Auth' // Import the getUsers function
import '../style/adminPrediction.css' // Import the new CSS file
import { formatDate } from '../utils/date'

interface Props {
  user: UserResponse | null
}

const AdminPredictions = ({ user }: Props) => {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [addedMatches, setAddedMatches] = useState<MatchResponse[]>([])
  const [options, setOptions] = useState<number[]>([])
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1)
  const [users, setUsers] = useState<UserResponse[]>([]) // State to hold users
  const [showMatchPredictions, setShowMatchPredictions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchAddedMatches = async () => {
      try {
        const matches = await getMatches()
        setAddedMatches(matches)
        const uniqueGameweeks = [...new Set(matches.map((match) => match.gameweek))]
        setOptions(uniqueGameweeks)

        // Set the default selected gameweek to the first not completed gameweek
        const firstNotCompletedGameweek = uniqueGameweeks
          .filter((gw) => !matches.find((match) => match.gameweek === gw && match.isCompleted))
          .sort((a, b) => a - b)[0]; // Get the first gameweek
        if (firstNotCompletedGameweek) {
          setSelectedGameweek(firstNotCompletedGameweek);
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
        setPredictions(data)
      } catch (error) {
        console.error('Error fetching predictions:', error)
      }
    }

    const fetchUsers = async () => {
      try {
        const userList = await GetUsers() // Fetch the list of users
        setUsers(userList)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    if (user?.role === 'admin') {
      fetchPredictions()
      fetchUsers() // Fetch users when the component mounts
    }
  }, [selectedGameweek, user])

  const handleGameweekChange = (gameweek: number) => {
    setSelectedGameweek(gameweek)
  }

  const toggleMatchPredictions = (matchId: string) => {
    setShowMatchPredictions(prev => ({
      ...prev,
      [matchId]: !prev[matchId], // Toggle visibility for the specific match
    }));
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
              <button onClick={() => toggleMatchPredictions(match._id)}>
                {showMatchPredictions[match._id] ? 'Hide Predictions' : 'Show Predictions'}
              </button>
              {showMatchPredictions[match._id] && (
                <>
                  {predictions
                    .filter((prediction) => prediction.match._id === match._id && prediction.predictedHomeScore !== null)
                    .map((prediction) => (
                      <div key={prediction._id} className="user-prediction">
                        <h4>{prediction.user.username} : {prediction.predictedHomeScore} - {prediction.predictedAwayScore} ; Pts: {prediction.points}</h4>
                      </div>
                    ))}
                  {predictions.filter((prediction) => prediction.match._id === match._id && prediction.predictedHomeScore !== null).length === 0 && (
                    <p>No predictions submitted yet.</p>
                  )}
                  {users
                    .filter(user => 
                      !predictions.some(prediction => 
                        prediction.match._id === match._id && prediction.user._id === user._id && prediction.predictedHomeScore !== null
                      )
                    )
                    .map((user) => (
                      <div key={user._id} className="user-no-prediction">
                        <h4>{user.username} did not submit a prediction.</h4>
                      </div>
                    ))}
                  {users
                    .filter(user => 
                      !predictions.some(prediction => 
                        prediction.match._id === match._id && prediction.user._id === user._id && prediction.predictedHomeScore !== null
                      )
                    ).length === 0 && (
                    <p>All users submitted their predictions.</p>
                  )}
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default AdminPredictions