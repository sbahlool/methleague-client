import { useEffect, useState } from 'react'
import { getPremierLeagueStandings, Table } from '../services/Standings'
import '../index.css'

const PremierLeagueStandings = () => {
  const [standings, setStandings] = useState<Table[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const getStandings = async () => {
      try {
        const data = await getPremierLeagueStandings()
        setStandings(data.standings[0].table)
      } catch (error) {
        setError('Failed to load standings')
        console.error('Error fetching standings:', error)
      }
    }

    getStandings()

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640) // Adjust based on your mobile breakpoint
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-purple-900 py-10">
      <h1 className="text-2xl text-purple-100 font-medium">2024-25 Season</h1>
      <div className="flex flex-col mt-6 w-full">
        <div className="overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 table-auto">
                <thead className="bg-purple-800 text-white text-xs uppercase font-medium">
                  <tr>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Club</th>
                    <th className="px-2 py-2 text-left">MP</th>
                    <th className="px-2 py-2 text-left">W</th>
                    <th className="px-2 py-2 text-left">D</th>
                    <th className="px-2 py-2 text-left">L</th>
                    <th className="px-2 py-2 text-left">GF</th>
                    <th className="px-2 py-2 text-left">GA</th>
                    <th className="px-2 py-2 text-left">GD</th>
                    <th className="px-2 py-2 text-left">Pts</th>
                    <th className="px-2 py-2 text-left">Last 5</th>
                  </tr>
                </thead>
                <tbody className="bg-black-800 divide-y text-xs">
                  {standings.map((team, index) => {
                    const position = index + 1 // Ensure position is calculated correctly
                    return (
                      <tr key={team.team.id} className={`bg-white bg-opacity-20 ${getPositionClass(position)}`}>
                        <td className="px-2 py-2">{position}</td>
                        <td className="flex items-center px-2 py-2 whitespace-nowrap">
                          <img className="w-6 h-6" src={team.team.crest} alt={team.team.shortName} />
                          <span className="ml-2 font-medium truncate font-bold">
                            {isMobile ? team.team.tla : team.team.shortName}
                          </span>
                        </td>
                        <td className="px-2 py-2">{team.playedGames}</td>
                        <td className="px-2 py-2">{team.won}</td>
                        <td className="px-2 py-2">{team.draw}</td>
                        <td className="px-2 py-2">{team.lost}</td>
                        <td className="px-2 py-2">{team.goalsFor}</td>
                        <td className="px-2 py-2">{team.goalsAgainst}</td>
                        <td className="px-2 py-2">{team.goalDifference}</td>
                        <td className="px-2 py-2">{team.points}</td>
                        <td className="flex items-center px-2 py-2">
                          {team.form ? (
                            team.form.split(',').map((result, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 fill-current ${
                                  result === 'W' ? 'text-green-600' : result === 'L' ? 'text-red-600' : 'text-gray-400'
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
                            ))
                          ) : (
                            <span className="text-gray-400"></span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getPositionClass = (position: number): string => {
  switch (position) {
    case 1:
      return 'border-b-2 border-green-300'
    case 5:
      return 'border-t-4 border-b-2 border-green-300'
    case 6:
      return 'border-t-4 border-b-2 border-green-300'
    case 18:
      return 'border-t-4 border-red-300'
    default:
      return ''
  }
}

export default PremierLeagueStandings
