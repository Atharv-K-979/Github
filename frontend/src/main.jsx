import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './authContext.jsx'
import { AppProvider } from './contexts/AppContext.jsx'
import ProjectRoutes from './Routes.jsx';
import { BrowserRouter as Router } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <AppProvider>
      <Router>
        <ProjectRoutes />
      </Router>
    </AppProvider>
  </AuthProvider>
);
