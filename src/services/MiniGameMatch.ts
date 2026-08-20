import Client from './api'

export interface ScoreRequest {
  userId: string
  score: number
}

export interface RecordScoreResponse {
  bestScore: number
  isNewBest: boolean
}

export interface HighScoreResponse {
  highScore: number
}

export const recordScore = async (userId: string, score: number): Promise<RecordScoreResponse> => {
  try {
    const res = await Client.post<RecordScoreResponse>('/minigame/score', { userId, score })
    return res.data
  } catch (error) {
    console.error('Failed to record score', error)
    throw error
  }
}

export const getHighScore = async (userId: string): Promise<number> => {
  try {
    const res = await Client.get<HighScoreResponse>(`/minigame/highscore/${userId}`)
    return res.data.highScore
  } catch (error) {
    console.error('Failed to retrieve high score', error)
    throw error
  }
}