import React from 'react'
import { Navigate } from 'react-router-dom'
import UserData from '../plugin/UserData'

function AdminRoute({ children }) {
  const userData = UserData()
  if (!userData || !userData.admin) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default AdminRoute
