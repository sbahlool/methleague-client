import Axios from 'axios'

export const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'https://methleague-e433e7bc8a2e.herokuapp.com/'

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
  (error) => Promise.reject(error),
)

export default Client
