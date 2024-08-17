import Client from './api'

export const LoginUser = async (data) => {
  try {
    const res = await Client.post('/auth/login', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.user.role) // Store the role in local storage
    return res.data.user
  } catch (error) {
    throw error
  }
}

export const RegisterUser = async (data) => {
  try {
    const res = await Client.post('/auth/register', data)
    return res.data
  } catch (error) {
    throw error
  }
}

export const ChangePassword = async (username, data) => {
  try {
    const res = await Client.put(`/auth/changePassword/${username}`, data)
    return res.data
  } catch (error) {
    throw error
  }
}

export const ViewProfile = async (username) => {
  try {
    const res = await Client.get(`/auth/profile/${username}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const EditProfile = async (username, data) => {
  try {
    const res = await Client.put(`/auth/editProfile/${username}`, data)
    return res.data
  } catch (error) {
    throw error
  }
}

export const CheckSession = async () => {
  try {
    const res = await Client.get('/auth/session', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return res.data
  } catch (error) {
    throw error
  }
}

// New function to fetch the list of teams
export const GetTeams = async () => {
  try {
    const res = await Client.get('/auth/teams')
    return res.data
  } catch (error) {
    throw error
  }
}

export const GetUsers = async () => {
  try {
    const res = await Client.get('/auth/users')
    return res.data
  } catch (error) {
    throw error
  }
}

export const GetUserById = async (id) => {
  try {
    const res = await Client.get(`/auth/users/${id}`)
    return res.data
  } catch (error) {
    throw error
  }
}
