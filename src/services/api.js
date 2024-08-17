import Axios from 'axios'

export const BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL ||
  'https://methleague-e433e7bc8a2e.herokuapp.com/'

const Client = Axios.create({ baseURL: BASE_URL })

Client.interceptors.request.use(
  (config) => {
    // Read token from localStorage
    const token = localStorage.getItem('token')
    // if token exists, we set the authorization header
    if (token) {
      config.headers['authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const fetchPremierLeagueStandings = async () => {
  try {
    const response = await Client.get('/api/standings')
    return response.data
  } catch (error) {
    console.error('Error fetching Premier League standings:', error)
    throw error
  }
}

export default Client
