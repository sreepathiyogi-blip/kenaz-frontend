import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Global reset + base styles
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; width: 100%; overflow-x: hidden; }
  body {
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    background-color: #09090b;
    background-image:
      radial-gradient(circle at 50% -20%, #2e1065 0%, #09090b 60%),
      radial-gradient(ellipse at 100% 100%, #1e1b4b 0%, transparent 60%);
    background-attachment: fixed;
    color: #f4f4f5;
    -webkit-font-smoothing: antialiased;
  }
  button { font-family: inherit; }
  input, select, textarea { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #333; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

