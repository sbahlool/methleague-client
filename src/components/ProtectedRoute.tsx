import { Navigate } from 'react-router-dom'

interface Props {
  children: React.ReactElement
}

const ProtectedRoute = ({ children }: Props) => {
  const isAdmin = localStorage.getItem('role') === 'admin'
  return isAdmin ? children : <Navigate to="/login" />
}

export default ProtectedRoute
