import { useSelector } from 'react-redux'
import Login from '../../Pages/Login'
import { Navigate } from 'react-router-dom'

function Protection({ children }) {
  const auth = useSelector(state => state.auth.value)
  if (!auth._id) {
    return <Navigate to={'/login'} replace />
  }
  return children

}

export default Protection
