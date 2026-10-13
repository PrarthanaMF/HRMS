import { useSelector } from 'react-redux'
import { Navigate} from 'react-router-dom'
import SessionLoading from './SessionLoading'

function LoginAuth  ({children})  {
    const { value: auth, status } = useSelector(state => state.auth)

    if (status === 'checking') {
        return <SessionLoading />
    }
    if(auth._id){
        return <Navigate to={'/'} replace />
    }
  return children
  
}

export default LoginAuth
