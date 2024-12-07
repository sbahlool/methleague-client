// import Client from './api'

// export const recordScore = async (userId: string, score: number): Promise<void> => {
//   try {
//     await Client.post('/minigame/score', { userId, score })
//   } catch (error) {
//     console.error('Failed to record score', error)
//     throw error
//   }
// }

// export const getHighScore = async (userId: string): Promise<number> => {
//   try {
//     const res = await Client.get(`/minigame/highscore/${userId}`)
//     return res.data.highScore
//   } catch (error) {
//     console.error('Failed to retrieve high score', error)
//     throw error
//   }
// }

// export interface ScoreRequest {
//   userId: string
//   score: number
// }

// export interface HighScoreResponse {
//   highScore: number
// }

// export const MiniGameMatch = {
//   recordScore,
//   getHighScore
// }