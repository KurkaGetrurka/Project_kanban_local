import React from 'react'
import ReactDOM from 'react-dom/client'
import AestheticKanbanBoard from './App.jsx'
import { SecurityDatabaseLauncher } from './kanban/components/security-database-launcher.jsx'
import { StartupDatabaseGate } from './kanban/components/startup-database-gate.jsx'
import { LEGACY_KEYS, STORAGE_KEY } from './kanban/shared.jsx'
import { installBrowserPersistenceGuard } from './kanban/security/browserStoragePolicy.js'
import './index.css'

installBrowserPersistenceGuard(STORAGE_KEY, LEGACY_KEYS)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AestheticKanbanBoard />
    <SecurityDatabaseLauncher />
    <StartupDatabaseGate />
  </React.StrictMode>,
)
