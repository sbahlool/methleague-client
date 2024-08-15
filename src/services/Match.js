import Client from './api'

export const addMatch = async (matchData) => {
  try {
    const res = await Client.post('match/matches', matchData)
    return res.data
  } catch (error) {
    throw error
  }
}
export const updateMatchScores = async (matchId, scores) => {
  try {
    const res = await Client.put(`match/update-scores/${matchId}`, scores)
    return res.data
  } catch (error) {
    console.error('Failed to update match scores', error)
    throw error
  }
}

export const getMatches = async () => {
  try {
    const res = await Client.get('match/matches')
    return res.data
  } catch (error) {
    throw error
  }
}

export const getMatchById = async (matchId) => {
  try {
    const res = await Client.get(`/match/match/${matchId}`)
    console.log('Request URL:', `/match/${matchId}`) // Log the request URL
    return res.data
  } catch (error) {
    console.error('Error fetching match:', error) // Log any errors
    throw error
  }
}
