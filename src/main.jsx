import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './Store/Redux/Store.jsx'
import { setUnauthorizedHandler } from './api/client'
import { removeAuth } from './Store/Redux/Login/AuthSlice'

// Session expired or logged out elsewhere: clear the login state; protected pages then go to /login
setUnauthorizedHandler(() => store.dispatch(removeAuth()))

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
)
