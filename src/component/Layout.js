import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col'>
        <Navbar/>
        <main className='flex-1 p-4 bg-base-100'><Outlet /></main>
    </div>
  )
}
