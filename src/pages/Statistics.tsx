import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GetUsers, UserResponse } from '../services/Auth'
import { getPredictions, PredictionResponse } from '../services/Prediction'
import { getMatches } from '../services/Match'
import { getProfilePictureUrl } from '../utils/image'
import '../style/statistics.css'

interface UserStats {
  user: UserResponse
  points: number
  totalPredictions: number
  perfectCount: number
  correctCount: number
  completedCount: number
  draws: number
  homeWins: number
  awayWins: number
}

interface Accolade {
  icon: string
  title: string
  description: string
  user: UserResponse
  statValue: string
}

// A user needs at least this many *completed* predictions to be eligible
// for the accuracy-based accolade — otherwise one lucky early guess could
// "win" it with a 100% sample size of one.
const MIN_SAMPLE_FOR_ACCURACY = 3

const Statistics = () => {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [completedMatchesPerGameweek, setCompletedMatchesPerGameweek] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [usersData, predictionsData, matchesData] = await Promise.all([
          GetUsers(),
          getPredictions(),
          getMatches(),
        ])
        setUsers(usersData)
        setPredictions(predictionsData)

        const gameweekCounts: Record<number, number> = {}
        matchesData
          .filter((m) => m.isCompleted)
          .forEach((m) => {
            gameweekCounts[m.gameweek] = (gameweekCounts[m.gameweek] || 0) + 1
          })
        setCompletedMatchesPerGameweek(gameweekCounts)
      } catch (err) {
        console.error('Failed to load statistics:', err)
        setError('Something went wrong loading statistics. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="stats-page">
        <div className="stats-state">Loading statistics…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stats-page">
        <div className="stats-state stats-state--error">{error}</div>
      </div>
    )
  }

  // Only completed matches — predictions for matches that haven't kicked
  // off yet must never factor into any stat here, since aggregate figures
  // (a popular scoreline, a "most home wins called" count, etc.) can leak
  // hints about what other people predicted before the deadline locks it.
  // Also excludes orphaned predictions whose user was since deleted.
  const submittedPredictions = predictions.filter(
    (p) => p.predictedHomeScore !== null && p.predictedAwayScore !== null && p.match?.isCompleted && p.user,
  )

  // ---------------------------------------------------------------
  // League-wide overview
  // ---------------------------------------------------------------
  const totalPredictions = submittedPredictions.length
  const totalPerfect = submittedPredictions.filter((p) => p.points === 3).length

  const accuracyRate =
    submittedPredictions.length > 0
      ? Math.round((submittedPredictions.filter((p) => p.points > 0).length / submittedPredictions.length) * 100)
      : 0

  const scorelineCounts: Record<string, number> = {}
  submittedPredictions.forEach((p) => {
    const key = `${p.predictedHomeScore} - ${p.predictedAwayScore}`
    scorelineCounts[key] = (scorelineCounts[key] || 0) + 1
  })
  const topScoreline = Object.entries(scorelineCounts).sort((a, b) => b[1] - a[1])[0]

  const teamCounts: Record<string, { teamname: string; logo: string; count: number }> = {}
  users.forEach((u) => {
    if (u.team) {
      const key = u.team._id
      if (!teamCounts[key]) {
        teamCounts[key] = { teamname: u.team.teamname, logo: u.team.logo, count: 0 }
      }
      teamCounts[key].count += 1
    }
  })
  const topTeam = Object.values(teamCounts).sort((a, b) => b.count - a.count)[0]

  // Mini Game best — separate from predictions entirely, just the
  // MatchHighScore field on each user. 0 means "hasn't played," so those
  // are excluded rather than treated as a suspiciously perfect score.
  const puzzleMaster = users
    .filter((u) => (u.MatchHighScore ?? 0) > 0)
    .sort((a, b) => (a.MatchHighScore ?? Infinity) - (b.MatchHighScore ?? Infinity))[0]

  // ---------------------------------------------------------------
  // Per-user stats, for the accolades below
  // ---------------------------------------------------------------
  const statsByUser: Record<string, UserStats> = {}
  users.forEach((user) => {
    statsByUser[user._id] = {
      user,
      points: 0,
      totalPredictions: 0,
      perfectCount: 0,
      correctCount: 0,
      completedCount: 0,
      draws: 0,
      homeWins: 0,
      awayWins: 0,
    }
  })

  submittedPredictions.forEach((p) => {
    const stats = statsByUser[p.user._id]
    if (!stats) return

    stats.points += p.points
    stats.totalPredictions += 1
    stats.completedCount += 1 // same as totalPredictions now — every entry here is a completed match
    if (p.points === 3) stats.perfectCount += 1
    if (p.points > 0) stats.correctCount += 1

    if (p.predictedHomeScore! > p.predictedAwayScore!) stats.homeWins += 1
    else if (p.predictedAwayScore! > p.predictedHomeScore!) stats.awayWins += 1
    else stats.draws += 1
  })

  const allStats = Object.values(statsByUser)

  const topByPoints = [...allStats].sort((a, b) => b.points - a.points)[0]
  const topByPerfect = [...allStats].sort((a, b) => b.perfectCount - a.perfectCount)[0]
  const topByActivity = [...allStats].sort((a, b) => b.totalPredictions - a.totalPredictions)[0]
  const topByDraws = [...allStats].sort((a, b) => b.draws - a.draws)[0]
  const topByHomeWins = [...allStats].sort((a, b) => b.homeWins - a.homeWins)[0]
  const topByAwayWins = [...allStats].sort((a, b) => b.awayWins - a.awayWins)[0]
  const topByAccuracy = [...allStats]
    .filter((s) => s.completedCount >= MIN_SAMPLE_FOR_ACCURACY)
    .sort((a, b) => b.correctCount / b.completedCount - a.correctCount / a.completedCount)[0]
  const lowestByAccuracy = [...allStats]
    .filter((s) => s.completedCount >= MIN_SAMPLE_FOR_ACCURACY)
    .sort((a, b) => a.correctCount / a.completedCount - b.correctCount / b.completedCount)[0]

  // Per-gameweek clean sweeps — a gameweek only counts if the user
  // predicted *every* completed match that week (not just some of them)
  // and got all of them right. Tallied across the whole season; whoever
  // has done it the most times wins the card.
  const gameweekGroups: Record<string, PredictionResponse[]> = {}
  submittedPredictions.forEach((p) => {
    const gw = p.match?.gameweek
    if (gw == null) return
    const key = `${p.user._id}:${gw}`
    if (!gameweekGroups[key]) gameweekGroups[key] = []
    gameweekGroups[key].push(p)
  })

  const perfectGameweekCounts: Record<string, number> = {}
  const cleanGameweekCounts: Record<string, number> = {}

  Object.values(gameweekGroups).forEach((group) => {
    const userId = group[0].user._id
    const gameweek = group[0].match!.gameweek
    const totalForGameweek = completedMatchesPerGameweek[gameweek] || 0

    // Must have predicted every completed match that gameweek, not just
    // however many they happened to submit.
    if (totalForGameweek === 0 || group.length !== totalForGameweek) return

    if (group.every((p) => p.points === 3)) {
      perfectGameweekCounts[userId] = (perfectGameweekCounts[userId] || 0) + 1
    }
    if (group.every((p) => p.points > 0)) {
      cleanGameweekCounts[userId] = (cleanGameweekCounts[userId] || 0) + 1
    }
  })

  const topPerfectGameweeks = users
    .map((user) => ({ user, count: perfectGameweekCounts[user._id] || 0 }))
    .sort((a, b) => b.count - a.count)[0]
  const topCleanGameweeks = users
    .map((user) => ({ user, count: cleanGameweekCounts[user._id] || 0 }))
    .sort((a, b) => b.count - a.count)[0]

  const accolades: Accolade[] = []

  if (topByPoints && topByPoints.points > 0) {
    accolades.push({
      icon: '🏆',
      title: 'Season Leader',
      description: 'Most total points',
      user: topByPoints.user,
      statValue: `${topByPoints.points} pts`,
    })
  }
  if (topByPerfect && topByPerfect.perfectCount > 0) {
    accolades.push({
      icon: '🎯',
      title: 'Sharpshooter',
      description: 'Most perfect scorelines called',
      user: topByPerfect.user,
      statValue: `${topByPerfect.perfectCount} perfect`,
    })
  }
  if (topByAccuracy) {
    const pct = Math.round((topByAccuracy.correctCount / topByAccuracy.completedCount) * 100)
    accolades.push({
      icon: '🧠',
      title: 'Most Accurate',
      description: `Highest hit rate (min. ${MIN_SAMPLE_FOR_ACCURACY} predictions)`,
      user: topByAccuracy.user,
      statValue: `${pct}%`,
    })
  }
  if (lowestByAccuracy) {
    const pct = Math.round((lowestByAccuracy.correctCount / lowestByAccuracy.completedCount) * 100)
    accolades.push({
      icon: '🥄',
      title: 'Wooden Spoon',
      description: `Lowest hit rate (min. ${MIN_SAMPLE_FOR_ACCURACY} predictions) — there's always next gameweek`,
      user: lowestByAccuracy.user,
      statValue: `${pct}%`,
    })
  }
  if (topPerfectGameweeks && topPerfectGameweeks.count > 0) {
    accolades.push({
      icon: '🌟',
      title: 'Perfect Gameweek',
      description: 'Called every match perfectly in a gameweek — most times this season',
      user: topPerfectGameweeks.user,
      statValue: `${topPerfectGameweeks.count}x`,
    })
  }
  if (topCleanGameweeks && topCleanGameweeks.count > 0) {
    accolades.push({
      icon: '✅',
      title: 'Clean Sweep',
      description: 'Got the correct result on every match in a gameweek — most times this season',
      user: topCleanGameweeks.user,
      statValue: `${topCleanGameweeks.count}x`,
    })
  }
  if (topByActivity && topByActivity.totalPredictions > 0) {
    accolades.push({
      icon: '🔥',
      title: 'Most Active',
      description: 'Most predictions submitted',
      user: topByActivity.user,
      statValue: `${topByActivity.totalPredictions} picks`,
    })
  }
  if (topByHomeWins && topByHomeWins.homeWins > 0) {
    accolades.push({
      icon: '🦁',
      title: 'Home Believer',
      description: 'Predicts the home team the most',
      user: topByHomeWins.user,
      statValue: `${topByHomeWins.homeWins} home wins called`,
    })
  }
  if (topByAwayWins && topByAwayWins.awayWins > 0) {
    accolades.push({
      icon: '⚔️',
      title: 'Upset Hunter',
      description: 'Backs the away team the most',
      user: topByAwayWins.user,
      statValue: `${topByAwayWins.awayWins} away wins called`,
    })
  }
  if (topByDraws && topByDraws.draws > 0) {
    accolades.push({
      icon: '🎲',
      title: 'Fence Sitter',
      description: 'Predicts the most draws',
      user: topByDraws.user,
      statValue: `${topByDraws.draws} draws called`,
    })
  }
  if (puzzleMaster) {
    accolades.push({
      icon: '🧩',
      title: 'Puzzle Master',
      description: 'Fewest turns in the Mini Game',
      user: puzzleMaster,
      statValue: `${puzzleMaster.MatchHighScore} turns`,
    })
  }

  return (
    <div className="stats-page">
      <h1 className="stats-title">League Statistics</h1>
      <p className="stats-subtitle">Based on completed gameweeks only — nothing here reveals live or upcoming picks.</p>

      <div className="stats-overview">
        <div className="stats-overview-card">
          <div className="stats-overview-number">{totalPredictions}</div>
          <div className="stats-overview-label">Predictions Scored</div>
        </div>
        <div className="stats-overview-card">
          <div className="stats-overview-number">{totalPerfect}</div>
          <div className="stats-overview-label">Perfect Scorelines</div>
        </div>
        <div className="stats-overview-card">
          <div className="stats-overview-number">{accuracyRate}%</div>
          <div className="stats-overview-label">League Accuracy</div>
        </div>
        <div className="stats-overview-card">
          <div className="stats-overview-number stats-overview-number--small">
            {topScoreline ? topScoreline[0] : '—'}
          </div>
          <div className="stats-overview-label">
            Most Called Scoreline{topScoreline ? ` (×${topScoreline[1]})` : ''}
          </div>
        </div>
      </div>

      {topTeam && (
        <div className="stats-fan-favorite">
          <img className="stats-fan-favorite-logo" src={`/uploads/${topTeam.logo}`} alt={`${topTeam.teamname} logo`} />
          <div>
            <div className="stats-fan-favorite-label">Fan Favorite Club</div>
            <div className="stats-fan-favorite-team">{topTeam.teamname}</div>
            <div className="stats-fan-favorite-count">
              {topTeam.count} {topTeam.count === 1 ? 'fan' : 'fans'}
            </div>
          </div>
        </div>
      )}

      <h2 className="stats-section-title">Accolades</h2>
      {accolades.length === 0 ? (
        <div className="stats-state">Not enough data yet — check back once more predictions are in.</div>
      ) : (
        <div className="accolades-grid">
          {accolades.map((accolade) => (
            <Link key={accolade.title} to={`/profile/${accolade.user.username}`} className="accolade-card">
              <div className="accolade-icon">{accolade.icon}</div>
              <div className="accolade-title">{accolade.title}</div>
              <div className="accolade-description">{accolade.description}</div>
              <div className="accolade-winner">
                <img
                  className="accolade-winner-avatar"
                  src={getProfilePictureUrl(accolade.user.profilePicture)}
                  alt={accolade.user.username}
                />
                <span className="accolade-winner-name">@{accolade.user.username}</span>
              </div>
              <div className="accolade-stat">{accolade.statValue}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Statistics
