import { useState, useEffect } from 'react'
import { GetUsers, UserResponse } from '../services/Auth'
import { getPredictions, PredictionResponse } from '../services/Prediction'
import '../index.css'

type UserWithStats = UserResponse & { points: number; perfect: number; rank: number; rankChange: number | null }

interface Props {
  currentUser: (UserResponse & { id?: string }) | null
}

const Rank = ({ currentUser }: Props) => {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [sortBy, setSortBy] = useState<'points' | 'perfect'>('points')

  useEffect(() => {
    const fetchUsersAndPredictions = async () => {
      try {
        const [usersData, predictionsData] = await Promise.all([GetUsers(), getPredictions()])

        const pointsMap = predictionsData.reduce((acc, prediction: PredictionResponse) => {
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

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-purple-900 py-10">
      <h1 className="text-2xl text-purple-100 font-bold mb-6">User Rankings</h1>
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-800">
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
                  <button onClick={() => setSortBy('points')} className="ml-1 text-purple-100 text-xs p-0.1" aria-label="Sort by points">▲</button>
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                <span className="hidden sm:inline">Perfecr</span>
                <span className="inline sm:hidden">Perf</span>
                  <button onClick={() => setSortBy('perfect')} className="ml-1 text-purple-100 text-xs p-0.1" aria-label="Sort by perfect predictions">▲</button>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const highlight = isCurrentUser(user)
                return (
                  <tr key={user._id} className={highlight ? 'bg-purple-100' : ''}>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center">
                        {user.rank}
                        {user.rankChange !== null && (
                          <span
                            className={`ml-1 ${
                              user.rankChange < 0
                                ? 'text-green-500'
                                : user.rankChange > 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {user.rankChange < 0 ? '▲' : user.rankChange > 0 ? '▼' : '•'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`/uploads/${user.profilePicture}`}
                          alt={`${user.username} profile`}
                        />
                        <div className="ml-2 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {`${user.firstname} ${user.lastname}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">{user.points}</td>
                    <td className="px-1 py-2 whitespace-nowrap text-center text-sm text-gray-500"> {/* Decreased padding */}
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
