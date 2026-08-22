import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GetUsers, UserResponse } from '../services/Auth'
import { getPredictions, PredictionResponse } from '../services/Prediction'
import { getProfilePictureUrl } from '../utils/image'
import '../index.css'
import '../style/rank.css'

type UserWithStats = UserResponse & { points: number; perfect: number; rank: number; rankChange: number | null }

interface Props {
  currentUser: (UserResponse & { id?: string }) | null
}

const Rank = ({ currentUser }: Props) => {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [sortBy, setSortBy] = useState<'points' | 'perfect'>('points')
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false)

  useEffect(() => {
    const fetchUsersAndPredictions = async () => {
      try {
        const [usersData, predictionsData] = await Promise.all([GetUsers(), getPredictions()])

        const pointsMap = predictionsData.reduce((acc, prediction: PredictionResponse) => {
          // A prediction's user can come back null if that user was
          // deleted after the prediction was made — populate() just
          // returns null rather than erroring, so skip these instead
          // of crashing on .user._id.
          if (!prediction.user) return acc

          const userId = prediction.user._id
          if (!acc[userId]) {
            acc[userId] = { points: 0, perfect: 0 }
          }
          acc[userId].points += prediction.points
          if (prediction.points === 3) {
            acc[userId].perfect += 1
          }
          return acc
        }, {} as Record<string, { points: number; perfect: number }>)

        const previousRanksString = localStorage.getItem('previousRanks')
        const previousRanks: Record<string, number> = previousRanksString ? JSON.parse(previousRanksString) : {}

        const usersWithStats: UserWithStats[] = usersData.map(user => ({
          ...user,
          points: pointsMap[user._id]?.points || 0,
          perfect: pointsMap[user._id]?.perfect || 0,
          rank: 0,
          rankChange: null
        }))

        const sortedUsers = sortUsers(usersWithStats, sortBy)
        const usersWithRanks = calculateRanks(sortedUsers, previousRanks)

        setUsers(usersWithRanks)

        // Store current ranks for next time
        const currentRanks = usersWithRanks.reduce((acc, user, index) => {
          acc[user._id] = index + 1
          return acc
        }, {} as Record<string, number>)
        localStorage.setItem('previousRanks', JSON.stringify(currentRanks))
      } catch (error) {
        console.error('Failed to fetch users or predictions:', error)
      }
    }

    fetchUsersAndPredictions()
  }, [sortBy])

  useEffect(() => {
    // Load Flourish script dynamically
    const script = document.createElement('script')
    script.src = "https://public.flourish.studio/resources/embed.js"
    script.async = true
    script.onload = () => setScriptLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script) // Clean up the script on unmount
    }
  }, []) // Run once on mount

  const sortUsers = (users: UserWithStats[], criteria: 'points' | 'perfect') => {
    return [...users].sort((a, b) => b[criteria] - a[criteria])
  }

  const calculateRanks = (sortedUsers: UserWithStats[], previousRanks: Record<string, number>) => {
    return sortedUsers.map((user, index) => {
      const currentRank = index + 1
      const previousRank = previousRanks[user._id]
      const rankChange = previousRank ? previousRank - currentRank : null
      return { ...user, rank: currentRank, rankChange }
    })
  }

  const isCurrentUser = (user: UserResponse) => currentUser && user._id === currentUser.id

  const rankBadgeClass = (rank: number) => {
    if (rank === 1) return 'rank-badge rank-badge--gold'
    if (rank === 2) return 'rank-badge rank-badge--silver'
    if (rank === 3) return 'rank-badge rank-badge--bronze'
    return 'rank-badge'
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="rank-page flex flex-col items-center justify-center w-screen min-h-screen py-10">
      <h1 className="rank-title text-2xl font-bold mb-6">User Rankings</h1>

      <div className="w-full max-w-3xl mx-auto">
        {scriptLoaded && (
          <div className="flourish-embed flourish-bar-chart-race w-full" data-src="visualisation/20188642">
            <noscript>
              <img src="https://public.flourish.studio/visualisation/20188642/thumbnail" width="100%" alt="bar-chart-race visualization" />
            </noscript>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rank-table-shell overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  <span className="hidden sm:inline">Points</span>
                  <span className="inline sm:hidden">Pts</span>
                  <button
                    onClick={() => setSortBy('points')}
                    className="rank-sort-btn ml-1 text-xs p-0.1"
                    aria-label="Sort by points"
                    aria-pressed={sortBy === 'points'}
                  >
                    ▲
                  </button>
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  <span className="hidden sm:inline">Perfect</span>
                  <span className="inline sm:hidden">Perf</span>
                  <button
                    onClick={() => setSortBy('perfect')}
                    className="rank-sort-btn ml-1 text-xs p-0.1"
                    aria-label="Sort by perfect predictions"
                    aria-pressed={sortBy === 'perfect'}
                  >
                    ▲
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => {
                const highlight = isCurrentUser(user)
                return (
                  <tr key={user._id} className={highlight ? 'rank-row--me' : ''}>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center gap-1">
                        <span className={rankBadgeClass(user.rank)}>{user.rank}</span>
                        {user.rankChange !== null && (
                          <span
                            className={
                              user.rankChange < 0
                                ? 'rank-change--down'
                                : user.rankChange > 0
                                ? 'rank-change--up'
                                : 'rank-change--flat'
                            }
                          >
                            {user.rankChange < 0 ? '▼' : user.rankChange > 0 ? '▲' : '•'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link to={`/profile/${user.username}`} className="rank-user-link">
                        <img
                          className="rank-avatar h-8 w-8 rounded-full"
                          src={getProfilePictureUrl(user.profilePicture)}
                          alt={`${user.username} profile`}
                        />
                        <div className="ml-2 overflow-hidden">
                          <div className="text-sm font-medium truncate">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {`${user.firstname} ${user.lastname}`}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm">{user.points}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-center text-sm">
                      {user.perfect}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Rank
