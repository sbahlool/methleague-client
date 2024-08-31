import React, { useState, useEffect } from 'react'
import { GetUsers } from '../services/Auth'
import { getPredictions } from '../services/Prediction'
import '../index.css'

const Rank = ({ currentUser }) => {
  console.log('Current user:', currentUser)
  const [users, setUsers] = useState([])
  const [userPoints, setUserPoints] = useState({})
  const [previousRanks, setPreviousRanks] = useState({})
  const [perfectPredictions, setPerfectPredictions] = useState([])

  useEffect(() => {
    const fetchUsersAndPredictions = async () => {
      try {
        const [usersData, predictionsData] = await Promise.all([
          GetUsers(),
          getPredictions()
        ])

        const pointsMap = predictionsData.reduce((acc, prediction) => {
          const userId = prediction.user._id
          if (!acc[userId]) {
            acc[userId] = { points: 0, perfect: 0 }
          }
          acc[userId].points += prediction.points

          if (prediction.points === 3) {
            acc[userId].perfect += 1
          }
          return acc
        }, {})

        const sortedUsers = usersData
          .map((user) => ({
            ...user,
            points: pointsMap[user._id]?.points || 0,
            perfect: pointsMap[user._id]?.perfect || 0
          }))
          .sort((a, b) => b.points - a.points)

        // Define currentRanks here
        const currentRanks = sortedUsers.reduce((acc, user, index) => {
          acc[user._id] = index + 1
          return acc
        }, {})

        const usersWithRank = sortedUsers.map((user) => {
          const previousRank = previousRanks[user._id]
          const currentRank = currentRanks[user._id]
          const rankChange =
            previousRank !== undefined ? previousRank - currentRank : null

          return {
            ...user,
            rank: currentRank,
            rankChange
          }
        })

        const sortedByPerfect = [...usersData]
          .map((user) => ({
            ...user,
            perfect: pointsMap[user._id]?.perfect || 0
          }))
          .sort((a, b) => b.perfect - a.perfect)

        setUsers(usersWithRank)
        setUserPoints(pointsMap)
        setPreviousRanks(currentRanks)
        setPerfectPredictions(sortedByPerfect)
      } catch (error) {
        console.error('Failed to fetch users or predictions:', error)
      }
    }

    fetchUsersAndPredictions()
  }, [])

  const isCurrentUser = (user) => {
    console.log('Comparing:', user._id, currentUser?.id)
    return currentUser && user._id === currentUser.id
  }

  if (!currentUser) {
    return <div>Loading...</div> // or any other loading indicator
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-purple-900 py-10">
      <h1 className="text-2xl text-purple-100 font-bold mb-6">User Rankings</h1>
      <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-800">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const highlight = isCurrentUser(user)
                console.log('User:', user.username, 'Highlight:', highlight)
                return (
                  <tr
                    key={user._id}
                    className={highlight ? 'bg-purple-100' : ''}
                  >
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
                            {user.rankChange < 0
                              ? '▲'
                              : user.rankChange > 0
                              ? '▼'
                              : '•'}
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
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500">{`${user.firstname} ${user.lastname}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">
                      {user.points}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table for Rankings by Perfect Predictions */}
        <div className="mt-8 overflow-x-auto shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-800">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Rank
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-center text-xs font-medium text-white uppercase tracking-wider"
                >
                  Perfect
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {perfectPredictions.map((user, index) => {
                const highlight = isCurrentUser(user)
                console.log(
                  'Perfect User:',
                  user.username,
                  'Highlight:',
                  highlight
                )
                return (
                  <tr
                    key={user._id}
                    className={highlight ? 'bg-purple-100' : ''}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`/uploads/${user.profilePicture}`}
                          alt={`${user.username} profile`}
                        />
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500">{`${user.firstname} ${user.lastname}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-center text-sm text-gray-500">
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
