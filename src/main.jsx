import React from 'react'
import ReactDOM from 'react-dom/client'
import AestheticKanbanBoard from './App.jsx'
import { SecurityDatabaseLauncher } from './kanban/components/security-database-launcher.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AestheticKanbanBoard />
    <SecurityDatabaseLauncher />
  </React.StrictMode>,
)
