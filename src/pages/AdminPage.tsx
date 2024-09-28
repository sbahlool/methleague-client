import React, { useState, useEffect } from 'react'
import { addMatch, getMatches, MatchRequest, MatchResponse, Scores, updateMatchScores } from '../services/Match'
import { getTeams, TeamResponse } from '../services/Auth'
import '../style/schedule.css'
import { formatDate } from '../utils/date'

const emptyMatchRequest: MatchRequest = {
  gameweek: '',
  date: '',
  time: '',
  homeTeam: '',
  awayTeam: '',
}

const AddMatch = () => {
  const [matchData, setMatchData] = useState<MatchRequest>({ ...emptyMatchRequest })
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [addedMatches, setAddedMatches] = useState<MatchResponse[]>([])
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1)
  const [options, setOptions] = useState<number[]>([])
  const [scores, setScores] = useState<Record<string, Scores>>({})

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams()
        setTeams(data)
      } catch (error) {
        console.error('Failed to fetch teams', error)
      }
    }

    fetchTeams()
  }, [])

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

  useEffect(() => {
    fetchAddedMatches()
  }, [])

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
    setMatchData((previous) => ({ ...previous, [e.target.name]: e.target.value }))
  }

  const handleGameweekChange = (gameweek: number) => {
    setSelectedGameweek(gameweek)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    try {
      await addMatch(matchData)
      alert('Match added successfully')
      setMatchData({ ...emptyMatchRequest })
      fetchAddedMatches()
    } catch (error) {
      console.error('Failed to add match', error)
    }
  }

  const handleScoreChange = (matchId: string, team: 'homeScore' | 'awayScore', value: string) => {
    setScores((previous) => ({
      ...previous,
      [matchId]: {
        ...previous[matchId],
        [team]: value,
      },
    }))
  }

  const handleScoreUpdate = async (matchId: string) => {
    const { homeScore, awayScore } = scores[matchId] || {}
    try {
      await updateMatchScores(matchId, { homeScore, awayScore })
      alert('Scores updated successfully')
      fetchAddedMatches()
    } catch (error) {
      console.error('Failed to update scores', error)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title">Add Match</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="number"
          name="gameweek"
          value={matchData.gameweek}
          onChange={handleChange}
          placeholder="Gameweek"
          required
          className="input"
        />
        <input type="date" name="date" value={matchData.date} onChange={handleChange} required className="input" />
        <input type="time" name="time" value={matchData.time} onChange={handleChange} required className="input" />
        <select name="homeTeam" value={matchData.homeTeam} onChange={handleChange} required className="select">
          <option value="">Home Team</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamname}
            </option>
          ))}
        </select>
        <select name="awayTeam" value={matchData.awayTeam} onChange={handleChange} required className="select">
          <option value="">Away Team</option>
          {teams.map((team) => (
            <option key={team._id} value={team._id}>
              {team.teamname}
            </option>
          ))}
        </select>
        <button type="submit" className="submit-button">
          Add Match
        </button>
      </form>

      <div className="matches-container">
        <h2 className="section-title">Added Matches</h2>
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
                <h3 className="match-header">
                  <img
                    src={`/uploads/${match.homeTeam.logo}`}
                    alt={`${match.homeTeam.teamname} logo`}
                    width="80"
                    className="team-logo"
                  />{' '}
                  {match.homeTeam.teamname} {match.isCompleted ? `${match.homeScore} - ${match.awayScore}` : 'vs'}{' '}
                  {match.awayTeam.teamname}
                  <img
                    src={`/uploads/${match.awayTeam.logo}`}
                    alt={`${match.awayTeam.teamname} logo`}
                    width="80"
                    className="team-logo"
                  />{' '}
                </h3>
                <p className="match-details">
                  Date: {formatDate(match.date)} <br /> Time: {match.time}
                </p>
                <div className="score-update flex items-center justify-center space-x-4 bg-white-800 p-6 rounded-lg shadow-md">
                  <label className="score-label flex items-center space-x-2">
                    <span className="text-black font-semibold">Home Score:</span>
                    <input
                      type="number"
                      value={(scores[match._id] && scores[match._id].homeScore) || ''}
                      onChange={(e) => handleScoreChange(match._id, 'homeScore', e.target.value)}
                      className="score-input w-12 p-2 bg-purple-200 text-black rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </label>
                  <label className="score-label flex items-center space-x-2">
                    <span className="text-black font-semibold">Away Score:</span>
                    <input
                      type="number"
                      value={(scores[match._id] && scores[match._id].awayScore) || ''}
                      onChange={(e) => handleScoreChange(match._id, 'awayScore', e.target.value)}
                      className="score-input w-12 p-2 bg-purple-200 text-black rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </label>
                  <button
                    onClick={() => handleScoreUpdate(match._id)}
                    className="update-score-button px-4 py-2 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Update Score
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default AddMatch
