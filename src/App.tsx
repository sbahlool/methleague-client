import { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router'
import { checkSession, UserResponse } from './services/Auth'
import NavBar from './components/NavBar'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import EditProfilePage from './pages/EditProfile'
import ChangePasswordPage from './pages/ChangePassword'
import AdminPage from './pages/AdminPage'
import AdminPredictions from './pages/AdminPredictions'
import ProtectedRoute from './components/ProtectedRoute'
import Rank from './pages/Rank'
import Schedule from './pages/Schedule'
import Match from './pages/Match'
import UserPredictions from './pages/UserPredictions'
import UpdatePrediction from './pages/UpdatePrediction'
import ForgotPassword from './pages/ForgotPasswordPage'
import ResetPassword from './pages/ResetPasswordPage'
import Table from './pages/Table'
import MiniGame from './pages/MiniGame'

import './index.css'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'

const App = () => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const handleLogOut = () => {
    setUser(null)
    localStorage.clear()
  }

  const checkToken = async () => {
    const user = await checkSession()
    setUser(user)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkToken()
    }
  }, [])

  return (
    <div>
      <NavBar user={user} handleLogOut={handleLogOut} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/table" element={<Table />} />
          <Route path="/minigame" element={<MiniGame />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-predictions"
            element={
              <ProtectedRoute>
                <AdminPredictions user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/profile/:username" element={<Profile user={user} />} />
          <Route path="/user/:userId/predictions" element={<UserPredictions />} />
          <Route path="/profile/edit/:username" element={<EditProfilePage />} />
          <Route path="/profile/security/:username" element={<ChangePasswordPage />} />
          <Route path="/Rank" element={<Rank currentUser={user} />} />
          <Route path="/Schedule" element={<Schedule currentUser={user} />} />
          <Route path="/match/:matchId" element={<Match />} />
          <Route path="/update-prediction/:matchId" element={<UpdatePrediction currentUser={user} />} />{' '}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/rank" element={<Rank currentUser={user} />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
