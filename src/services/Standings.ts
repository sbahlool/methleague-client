import Client from './api'

export const getPremierLeagueStandings = async (): Promise<StandingsResponse> => {
  try {
    const response = await Client.get<StandingsResponse>('/api/standings')
    return response.data
  } catch (error) {
    console.error('Error fetching Premier League standings:', error)
    throw error
  }
}

interface StandingsResponse {
  filters: Filters
  area: Area
  competition: Competition
  season: Season
  standings: Standing[]
}

interface Filters {
  season: string
}

interface Area {
  id: number
  name: string
  code: string
  flag: string
}

interface Competition {
  id: number
  name: string
  code: string
  type: string
  emblem: string
}

interface Season {
  id: number
  startDate: string
  endDate: string
  currentMatchday: number
  winner: any
}

interface Standing {
  stage: string
  type: string
  group: any
  table: Table[]
}

export interface Table {
  position: number
  team: Team
  playedGames: number
  form: string | null
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}
