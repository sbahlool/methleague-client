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
      <h1 className="text-2xl text-purple-100 font-medium">User Rankings</h1>
      <div className="table-container mt-6 px-6">
        {/* Table for Rankings by Points */}
        <div className="table-wrapper">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full">
              <div className="shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full text-sm text-black-400">
                  <thead className="bg-purple-800 text-white text-s uppercase font-medium">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Team
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-black-800">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="bg-white bg-opacity-20 text-base"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.rank}
                        </td>
                        <td className="flex px-6 py-4 whitespace-nowrap">
                          <img
                            className="w-6 rounded-full"
                            src={`/uploads/${user.profilePicture}`}
                            alt={`${user.username} profile`}
                          />
                          <span className="ml-2 font-medium">
                            {user.username}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.team && (
                            <div className="flex items-center">
                              <img
                                src={`/uploads/${user.team.logo}`}
                                alt={`${user.team.teamname} logo`}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="ml-2">{user.team.teamname}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Table for Rankings by Perfect Predictions */}
        <div className="table-wrapper">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full">
              <div className="shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full text-sm text-black-400">
                  <thead className="bg-purple-800 text-white text-s uppercase font-medium">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Rank
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Username
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Team
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left tracking-wider"
                      >
                        Perfect Predictions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-black-800">
                    {perfectPredictions.map((user, index) => (
                      <tr
                        key={user._id}
                        className="bg-white bg-opacity-20 text-base"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="flex px-6 py-4 whitespace-nowrap">
                          <img
                            className="w-6 rounded-full"
                            src={`/uploads/${user.profilePicture}`}
                            alt={`${user.username} profile`}
                          />
                          <span className="ml-2 font-medium">
                            {user.username}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.team && (
                            <div className="flex items-center">
                              <img
                                src={`/uploads/${user.team.logo}`}
                                alt={`${user.team.teamname} logo`}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="ml-2">{user.team.teamname}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
