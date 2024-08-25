import React, { useState, useEffect } from 'react'
import { GetUsers } from '../services/Auth'
import { getPredictions } from '../services/Prediction'
import '../index.css'

const Rank = () => {
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

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-purple-900 py-10">
      <h1 className="text-2xl text-purple-100 font-bold">User Rankings</h1>
      <div className="table-container mt-6 px-4 sm:px-6 lg:px-8 w-full">
        {/* Table for Rankings by Points */}
        <div className="table-wrapper">
          <div className="overflow-x-auto">
            <div className="py-2 align-middle inline-block min-w-full">
              <div className="shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full text-sm text-black-400 table-fixed">
                  <thead className="bg-purple-800 text-white text-xs uppercase font-bold">
                    <tr>
                      <th className="px-1 py-1 text-center">Rank</th>
                      <th className="px-1 py-1 text-center">Username</th>
                      <th className="px-1 py-1 text-left"></th>
                      <th className="px-1 py-1 text-center">Points</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black-800">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="bg-white bg-opacity-20 text-base"
                      >
                        <td className="px-1 py-1 text-center">{user.rank}</td>
                        <td className="flex items-center px-1 py-1">
                          <img
                            className="w-8 h-8 rounded-full"
                            src={`/uploads/${user.profilePicture}`}
                            alt={`${user.username} profile`}
                          />
                          <span className="ml-2 font-bold">
                            {user.username}
                          </span>
                        </td>
                        <td className="px-1 py-1">
                          {user.team && (
                            <div className="flex items-center">
                              <img
                                src={`/uploads/${user.team.logo}`}
                                alt={`${user.team.teamname} logo`}
                                className="w-8 h-8 rounded-full"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-1 py-1 text-center">{user.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Table for Rankings by Perfect Predictions */}
        <div className="table-wrapper mt-6">
          <div className="overflow-x-auto">
            <div className="py-2 align-middle inline-block min-w-full">
              <div className="shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full text-sm text-black-400 table-fixed">
                  <thead className="bg-purple-800 text-white text-xs uppercase font-bold">
                    <tr>
                      <th className="px-1 py-1 text-center">Rank</th>
                      <th className="px-1 py-1 text-center">Username</th>
                      <th className="px-1 py-1 text-left"></th>
                      <th className="px-1 py-1 text-center">Perfect</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black-800">
                    {perfectPredictions.map((user, index) => (
                      <tr
                        key={user._id}
                        className="bg-white bg-opacity-20 text-base"
                      >
                        <td className="px-1 py-1 text-center">{index + 1}</td>
                        <td className="flex items-center px-1 py-1">
                          <img
                            className="w-8 h-8 rounded-full"
                            src={`/uploads/${user.profilePicture}`}
                            alt={`${user.username} profile`}
                          />
                          <span className="ml-2 font-bold">
                            {user.username}
                          </span>
                        </td>
                        <td className="px-1 py-1">
                          {user.team && (
                            <div className="flex items-center">
                              <img
                                src={`/uploads/${user.team.logo}`}
                                alt={`${user.team.teamname} logo`}
                                className="w-8 h-8 rounded-full"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-1 py-1 text-center">
                          {user.perfect}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rank
