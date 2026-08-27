import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupMockApi } from './api/mockFetch'

// 24시간 오프라인 프로토타입 시연용 API Mocking 초기화
setupMockApi();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
