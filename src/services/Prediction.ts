import Client from './api'
import { MatchResponse } from './Match'

export const addPrediction = async (predictionData: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const res = await Client.post<PredictionResponse>('/predictions', predictionData)
    return res.data
  } catch (error) {
    throw error
  }
}

export const updatePrediction = async (
  predictionid: string,
  predictionData: UpdatePredictionRequest,
): Promise<PredictionResponse> => {
  try {
    const res = await Client.put<PredictionResponse>(`/predictions/${predictionid}`, predictionData)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getPredictions = async (): Promise<PredictionResponse[]> => {
  try {
    const res = await Client.get<PredictionResponse[]>('/predictions')
    return res.data
  } catch (error) {
    throw error
  }
}

export const getMatchById = async (matchId: string): Promise<MatchResponse> => {
  try {
    const res = await Client.get<MatchResponse>(`/match/${matchId}`)
    return res.data
  } catch (error) {
    console.error('Failed to fetch match by ID:', error)
    throw error
  }
}

export const getUserPrediction = async (matchId: string, userId: string): Promise<PredictionResponse> => {
  try {
    const res = await Client.get<PredictionResponse>(`/predictions?match=${matchId}&user=${userId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getUserPredictions = async (userId: string): Promise<PredictionResponse[]> => {
  try {
    const res = await Client.get<PredictionResponse[]>(`/predictions/user/${userId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getPrediction = async (userId: string, matchId: string): Promise<PredictionResponse> => {
  try {
    const res = await Client.get<PredictionResponse>(`/predictions/user/${userId}/match/${matchId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getPredictionByUserAndMatch = async (userId: string, matchId: string): Promise<PredictionResponse> => {
  try {
    const res = await Client.get<PredictionResponse>(`/predictions/user/${userId}/match/${matchId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getAllPredictions = async (): Promise<PredictionResponse[]> => {
  try {
    const res = await Client.get<PredictionResponse[]>('/predictions')
    return res.data
  } catch (error) {
    throw error
  }
}

// Update the function to call the correct route
export const getAllPredictionsByGameweek = async (gameweek: number): Promise<PredictionResponse[]> => {
  try {
    const res = await Client.get<PredictionResponse[]>(`/predictions/admin/predictions/gameweek/${gameweek}`)
    return res.data
  } catch (error) {
    throw error
  }
}

interface PredictionRequest {
  match: string
  user: string
  predictedHomeScore: number
  predictedAwayScore: number
}

interface UpdatePredictionRequest {
  predictedHomeScore: string
  predictedAwayScore: string
}

export interface PredictionResponse {
  _id: string
  match: MatchResponse
  user: User
  predictedHomeScore: number
  predictedAwayScore: number
  points: number
  __v: number
}

interface User {
  _id: string
  username: string
  email: string
  passwordDigest: string
  firstname: string
  lastname: string
  profilePicture: string
  team: string
  role: string
  createdAt: string
  updatedAt: string
  __v: number
}
