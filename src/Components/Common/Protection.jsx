import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import SessionLoading from './SessionLoading'

function Protection({ children }) {
  const { value: auth, status } = useSelector(state => state.auth)
  if (status === 'checking') {
    return <SessionLoading />
  }
  if (!auth._id) {
    return <Navigate to={'/login'} replace />
  }
  return children

}

export default Protection
