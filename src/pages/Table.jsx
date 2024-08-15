import React, { useEffect, useState } from 'react'
import { fetchPremierLeagueStandings } from '../services/api' // Ensure the correct path to the API file
import '../index.css'

const PremierLeagueStandings = () => {
  const [standings, setStandings] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const getStandings = async () => {
      try {
        const data = await fetchPremierLeagueStandings()
        setStandings(data.standings[0].table)
      } catch (error) {
        setError('Failed to load standings')
        console.error('Error fetching standings:', error)
      }
    }

    getStandings()
  }, [])

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-purple-900 py-10">
      <h1 className="text-2xl text-purple-100 font-medium">2024-25 Season</h1>
      <div className="flex flex-col mt-6">
        <div className="overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-800 text-white text-s uppercase font-medium">
                  <tr>
                    <th></th>
                    <th className="px-6 py-3 text-left tracking-wider">Club</th>
                    <th className="px-6 py-3 text-left tracking-wider">MP</th>
                    <th className="px-6 py-3 text-left tracking-wider">W</th>
                    <th className="px-6 py-3 text-left tracking-wider">D</th>
                    <th className="px-6 py-3 text-left tracking-wider">L</th>
                    <th className="px-6 py-3 text-left tracking-wider">GF</th>
                    <th className="px-6 py-3 text-left tracking-wider">GA</th>
                    <th className="px-6 py-3 text-left tracking-wider">GD</th>
                    <th className="px-6 py-3 text-left tracking-wider">Pts</th>
                    <th className="px-6 py-3 text-left tracking-wider">
                      Last 5
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-black-800 divide-y divide-gray-600">
                  {standings.map((team) => (
                    <tr
                      key={team.team.id}
                      className="bg-white bg-opacity-20 text-base"
                    >
                      <td className="pl-4">{team.position}</td>
                      <td className="flex items-center px-6 py-4 whitespace-nowrap">
                        <img
                          className="w-6"
                          src={team.team.crest}
                          alt={team.team.shortName}
                        />
                        <span className="ml-2 font-medium">
                          {team.team.shortName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-base whitespace-nowrap">
                        {team.playedGames}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.won}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.draw}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.lost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.goalsFor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.goalsAgainst}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.goalDifference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {team.points}
                      </td>
                      <td className="flex items-center px-6 py-4 whitespace-nowrap">
                        {team.form &&
                          team.form.split(',').map((result, index) => (
                            <svg
                              key={index}
                              className={`w-4 fill-current ${
                                result === 'W'
                                  ? 'text-green-600'
                                  : result === 'L'
                                  ? 'text-red-600'
                                  : 'text-gray-400'
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ))}
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
  )
}

export default PremierLeagueStandings
