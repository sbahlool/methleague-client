// services/Prediction.js

import Client from './api'

export const addPrediction = async (predictionData) => {
  try {
    const res = await Client.post('/predictions', predictionData)
    return res.data
  } catch (error) {
    throw error
  }
}

export const updatePrediction = async (predictionid, predictionData) => {
  try {
    const res = await Client.put(`/predictions/${predictionid}`, predictionData)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getPredictions = async () => {
  try {
    const res = await Client.get('/predictions')
    return res.data
  } catch (error) {
    throw error
  }
}

export const getMatchById = async (matchId) => {
  try {
    const res = await Client.get(`/match/${matchId}`)
    return res.data
  } catch (error) {
    console.error('Failed to fetch match by ID:', error)
    throw error
  }
}

export const getUserPrediction = async (matchId, userId) => {
  try {
    const res = await Client.get(`/predictions?match=${matchId}&user=${userId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getUserPredictions = async (userId) => {
  try {
    const res = await Client.get(`/predictions/user/${userId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getPrediction = async (userId, matchId) => {
  try {
    const res = await Client.get(`/predictions/user/${userId}/match/${matchId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getPredictionByUserAndMatch = async (userId, matchId) => {
  try {
    const res = await Client.get(`/predictions/user/${userId}/match/${matchId}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const getAllPredictions = async () => {
  try {
    const res = await Client.get('/predictions')
    return res.data
  } catch (error) {
    throw error
  }
}

// Update the function to call the correct route
export const getAllPredictionsByGameweek = async (gameweek) => {
  try {
    const res = await Client.get(
      `/predictions/admin/predictions/gameweek/${gameweek}`
    )
    return res.data
  } catch (error) {
    throw error
  }
}
