/**
 * System: Base Event Platformer
 * Module: Application Bootstrap
 * Purpose: Mount the React application into the DOM root element
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const objRootElement = document.getElementById('root')

if (!objRootElement) {
  throw new Error('Root element with id "root" is required')
}

const objRoot = ReactDOM.createRoot(objRootElement)

objRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
