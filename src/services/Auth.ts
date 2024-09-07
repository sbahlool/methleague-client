import Client from './api'

export const loginUser = async (data: LoginRequest): Promise<LoginResponse['user']> => {
  try {
    const res = await Client.post<LoginResponse>('/auth/login', data)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.user.role)
    return res.data.user
  } catch (error) {
    throw error
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  user: { id: string; username: string; role: string }
  token: string
}

export const registerUser = async (data: RegisterUserRequest): Promise<UserResponse> => {
  try {
    const res = await Client.post<UserResponse>('/auth/register', data)
    return res.data
  } catch (error) {
    throw error
  }
}

export interface RegisterUserRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstname: string
  lastname: string
  team: string
}

export const changePassword = async (username: string, data: ChangePasswordRequest): Promise<unknown> => {
  try {
    const res = await Client.put(`/auth/changePassword/${username}`, data)
    return res.data
  } catch (error) {
    throw error
  }
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export const getProfile = async (username: string): Promise<UserResponse> => {
  try {
    const res = await Client.get<UserResponse>(`/auth/profile/${username}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export const editProfile = async (username: string, data: EditProfileRequest) => {
  try {
    const res = await Client.put(`/auth/editProfile/${username}`, data)
    return res.data
  } catch (error) {
    throw error
  }
}

export interface EditProfileRequest {
  username: string
  email: string
  firstname: string
  lastname: string
  team: string
}

export const checkSession = async () => {
  try {
    const res = await Client.get('/auth/session', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    return res.data
  } catch (error) {
    throw error
  }
}

export const getTeams = async (): Promise<TeamResponse[]> => {
  try {
    const res = await Client.get<TeamResponse[]>('/auth/teams')
    return res.data
  } catch (error) {
    throw error
  }
}

export interface TeamResponse {
  _id: string
  teamname: string
  logo: string
  __v: number
}

export const GetUsers = async (): Promise<UserResponse[]> => {
  try {
    const res = await Client.get<UserResponse[]>('/auth/users')
    return res.data
  } catch (error) {
    throw error
  }
}

export const GetUserById = async (id: string): Promise<UserResponse> => {
  try {
    const res = await Client.get<UserResponse>(`/auth/users/${id}`)
    return res.data
  } catch (error) {
    throw error
  }
}

export interface UserResponse {
  _id: string
  username: string
  email: string
  passwordDigest: string
  firstname: string
  lastname: string
  profilePicture: string
  team: {
    _id: string
    teamname: string
    logo: string
    __v: number
  }
  role: string
  createdAt: string
  updatedAt: string
  __v: number
}

export const forgotPassword = async (email: string): Promise<any> => {
  try {
    const API_URL = 'https://methleague-e433e7bc8a2e.herokuapp.com/'; // Replace with your actual API URL
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    throw error;
  }
};

export const resetPassword = async (token: string, newPassword: string): Promise<unknown> => {
  const response = await fetch('/password-reset/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  })
  if (!response.ok) throw new Error('Failed to reset password')
  return response.json()
}

// New function to fetch the current user
export const GetCurrentUser = async (): Promise<UserResponse> => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No token found')
    }
    const res = await Client.get('/auth/current-user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}
