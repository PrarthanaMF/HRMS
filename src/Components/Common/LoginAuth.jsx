import { useSelector } from 'react-redux'
import { Navigate} from 'react-router-dom'

function LoginAuth  ({children})  {
    const auth = useSelector(state=>state.auth.value)
    console.log('auth',auth)
    if(auth._id){
        return <Navigate to={'/'} replace />
    }
  return children
  
}

export default LoginAuth
