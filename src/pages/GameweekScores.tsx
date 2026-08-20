import { useState, useEffect } from 'react'
import { GetUsers, UserResponse } from '../services/Auth'
import { getGameweekScores } from '../services/Gameweek' // New service for gameweek scores
import '../index.css'

// Define the GameweekScoreResponse type
type GameweekScoreResponse = Record<string, Record<number, number>> // Assuming scores are keyed by user ID and gameweek number

type UserWithScores = UserResponse & { scores: Record<number, number> } // Adjusted type for scores

interface Props {
  currentUser: (UserResponse & { id?: string }) | null
}

const GameweekScores = ({ currentUser }: Props) => {
  const [users, setUsers] = useState<UserWithScores[]>([])
  const [gameweek, setGameweek] = useState<number>(1) // State for selected gameweek

  useEffect(() => {
    const fetchUsersAndScores = async () => {
      try {
        const usersData = await GetUsers()
        const scoresData: GameweekScoreResponse = await getGameweekScores(gameweek) // Fetch scores for the selected gameweek

        const usersWithScores: UserWithScores[] = usersData.map(user => ({
          ...user,
          scores: scoresData[user._id] || {} // Map scores to users
        }))

        setUsers(usersWithScores)
      } catch (error) {
        console.error('Failed to fetch users or scores:', error)
      }
    }

    fetchUsersAndScores()
  }, [gameweek]) // Fetch scores when gameweek changes

  const isCurrentUser = (user: UserResponse) => currentUser && user._id === currentUser.id

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-purple-900 py-10">
      <h1 className="text-2xl text-purple-100 font-bold mb-6">Gameweek Scores</h1>

      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-800">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const highlight = isCurrentUser(user)
                return (
                  <tr key={user._id} className={highlight ? 'bg-purple-100' : ''}>
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
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">
                      {user.scores[gameweek] || 0} {/* Display score for the selected gameweek */}
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

export default GameweekScores