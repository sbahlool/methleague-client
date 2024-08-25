import Client from './api'

export const addMatch = async (matchData: MatchRequest): Promise<MatchResponse> => {
  try {
    const res = await Client.post<MatchResponse>('match/matches', matchData)
    return res.data
  } catch (error) {
    throw error
  }
}
export const updateMatchScores = async (matchId: string, scores: Scores): Promise<MatchResponse> => {
  try {
    const res = await Client.put<MatchResponse>(`match/update-scores/${matchId}`, scores)
    return res.data
  } catch (error) {
    console.error('Failed to update match scores', error)
    throw error
  }
}

export interface Scores {
  homeScore: string
  awayScore: string
}

export const getMatches = async (): Promise<MatchResponse[]> => {
  try {
    const res = await Client.get<MatchResponse[]>('match/matches')
    return res.data
  } catch (error) {
    throw error
  }
}

export const getMatchById = async (matchId: string): Promise<MatchResponse> => {
  try {
    const res = await Client.get<MatchResponse>(`/match/match/${matchId}`)
    console.log('Request URL:', `/match/${matchId}`) // Log the request URL
    return res.data
  } catch (error) {
    console.error('Error fetching match:', error) // Log any errors
    throw error
  }
}

export interface MatchRequest {
  gameweek: string
  date: string
  time: string
  homeTeam: string
  awayTeam: string
}

export interface MatchResponse {
  _id: string
  gameweek: number
  date: string
  time: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number
  awayScore: number
  isCompleted: boolean
  __v: number
}

interface Team {
  _id: string
  teamname: string
  logo: string
  __v: number
}
