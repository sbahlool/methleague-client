import axios from 'axios';

// Define the GameweekScoreResponse type
export type GameweekScoreResponse = Record<string, Record<number, number>>; // Assuming scores are keyed by user ID and gameweek number

// Function to fetch gameweek scores
export const getGameweekScores = async (gameweek: number): Promise<GameweekScoreResponse> => {
  try {
    const response = await axios.get(`/api/gameweek-scores?gameweek=${gameweek}`);
    return response.data; // Assuming the API returns the scores in the expected format
  } catch (error) {
    console.error('Error fetching gameweek scores:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
};