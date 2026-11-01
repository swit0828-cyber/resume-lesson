import React from 'react'
import ReactDOM from 'react-dom/client'
import Teacher from './Teacher.jsx'
import './index.css'
import './classCheck.css'

document.body.classList.add('cc-body')
ReactDOM.createRoot(document.getElementById('root')).render(<Teacher />)
