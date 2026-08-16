import React, { useEffect, useRef, useState } from 'react'
import { addMatch, getMatches, MatchRequest, MatchResponse, Scores, updateMatchScores } from '../services/Match'
import { getTeams, TeamResponse } from '../services/Auth'
import '../style/schedule.css'
import '../style/admin.css'
import { formatDate } from '../utils/date'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useToast } from '../context/ToastContext'

const emptyMatchRequest: MatchRequest = {
  gameweek: '',
  date: '',
  time: '',
  homeTeam: '',
  awayTeam: '',
}

const AddMatch = () => {
  const { showToast } = useToast()
  const [matchData, setMatchData] = useState<MatchRequest>({ ...emptyMatchRequest })
  const [teams, setTeams] = useState<TeamResponse[]>([])
  const [addedMatches, setAddedMatches] = useState<MatchResponse[]>([])
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1)
  const [options, setOptions] = useState<number[]>([])
  const [scores, setScores] = useState<Record<string, Scores>>({})

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const selectedTabRef = useRef<HTMLLabelElement | null>(null)

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

  useEffect(() => {
    fetchAddedMatches()
  }, [])

  // Keep the active gameweek tab centered in view whenever it changes.
  useEffect(() => {
    selectedTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedGameweek, options])

  const scrollGameweeks = (direction: 1 | -1) => {
    scrollContainerRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }

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
      showToast('Match added successfully', 'success')
      setMatchData({ ...emptyMatchRequest })
      fetchAddedMatches()
    } catch (error) {
      console.error('Failed to add match', error)
      showToast('Failed to add match. Please try again.', 'error')
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
      showToast('Scores updated successfully', 'success')
      fetchAddedMatches()
    } catch (error) {
      console.error('Failed to update scores', error)
      showToast('Failed to update scores. Please try again.', 'error')
    }
  }

  const previewHomeTeam = teams.find((team) => team._id === matchData.homeTeam)
  const previewAwayTeam = teams.find((team) => team._id === matchData.awayTeam)

  return (
    <div className="admin-page">
      <h1 className="page-title">Manage Matches</h1>

      <div className="admin-layout">
        {/* ------------------------------------------------------------ */}
        {/* Add match                                                    */}
        {/* ------------------------------------------------------------ */}
        <section className="admin-card">
          <h2 className="section-title">Add Match</h2>
          <form onSubmit={handleSubmit} className="match-form">
            <div className="field-row">
              <div className="field-group">
                <label className="field-label" htmlFor="gameweek">
                  Gameweek
                </label>
                <input
                  id="gameweek"
                  type="number"
                  name="gameweek"
                  value={matchData.gameweek}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                  required
                  className="admin-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={matchData.date}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>
              <div className="field-group">
                <label className="field-label" htmlFor="time">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  name="time"
                  value={matchData.time}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>
            </div>

            <div className="team-select-row">
              <div className="field-group team-field">
                <label className="field-label" htmlFor="homeTeam">
                  Home Team
                </label>
                <select
                  id="homeTeam"
                  name="homeTeam"
                  value={matchData.homeTeam}
                  onChange={handleChange}
                  required
                  className="admin-select"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.teamname}
                    </option>
                  ))}
                </select>
              </div>
              <span className="vs-divider">VS</span>
              <div className="field-group team-field">
                <label className="field-label" htmlFor="awayTeam">
                  Away Team
                </label>
                <select
                  id="awayTeam"
                  name="awayTeam"
                  value={matchData.awayTeam}
                  onChange={handleChange}
                  required
                  className="admin-select"
                >
                  <option value="">Select team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.teamname}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live preview — shows the actual match card this will create,
                using the same styling as the public schedule, before you submit. */}
            {(previewHomeTeam || previewAwayTeam) && (
              <div className="match-preview">
                <div className="preview-label">Preview</div>
                <div className="match">
                  <div className="match-header">
                    <div className="match-status is-upcoming">Upcoming</div>
                    <div className="match-date-time">
                      {matchData.date ? formatDate(matchData.date) : 'Date'} {matchData.time || '--:--'}
                    </div>
                    <img className="match-tournament" src="/uploads/epl-logo.png" alt="Premier League" />
                  </div>
                  <div className="match-content">
                    <div className="team team--home">
                      {previewHomeTeam ? (
                        <img
                          className="team-logo"
                          src={`/uploads/${previewHomeTeam.logo}`}
                          alt={`${previewHomeTeam.teamname} logo`}
                        />
                      ) : (
                        <div className="team-logo-placeholder" />
                      )}
                      <div className="team-name">{previewHomeTeam?.teamname || 'Home'}</div>
                    </div>
                    <div className="match-score">
                      <span className="match-score-number">-</span>
                      <span className="match-score-divider">:</span>
                      <span className="match-score-number">-</span>
                    </div>
                    <div className="team team--away">
                      {previewAwayTeam ? (
                        <img
                          className="team-logo"
                          src={`/uploads/${previewAwayTeam.logo}`}
                          alt={`${previewAwayTeam.teamname} logo`}
                        />
                      ) : (
                        <div className="team-logo-placeholder" />
                      )}
                      <div className="team-name">{previewAwayTeam?.teamname || 'Away'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="admin-submit">
              Add Match
            </button>
          </form>
        </section>

        {/* ------------------------------------------------------------ */}
        {/* Added matches                                                */}
        {/* ------------------------------------------------------------ */}
        <section className="admin-card">
          <h2 className="section-title">Added Matches</h2>

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
              .map((match) => (
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

                  <div className="admin-score-row">
                    <input
                      type="number"
                      min="0"
                      placeholder="Home"
                      value={(scores[match._id] && scores[match._id].homeScore) || ''}
                      onChange={(e) => handleScoreChange(match._id, 'homeScore', e.target.value)}
                      className="admin-score-input"
                      aria-label={`${match.homeTeam.teamname} score`}
                    />
                    <span className="score-sep">-</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Away"
                      value={(scores[match._id] && scores[match._id].awayScore) || ''}
                      onChange={(e) => handleScoreChange(match._id, 'awayScore', e.target.value)}
                      className="admin-score-input"
                      aria-label={`${match.awayTeam.teamname} score`}
                    />
                    <button onClick={() => handleScoreUpdate(match._id)} className="admin-update-btn">
                      Update Score
                    </button>
                  </div>
                </div>
              ))}
            {addedMatches.filter((match) => match.gameweek === selectedGameweek).length === 0 && (
              <div className="admin-empty-state">No matches added for this gameweek yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AddMatch
