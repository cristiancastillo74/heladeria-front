import React from 'react'
import Navbar from './Navbar'

export default function Layout({children}) {
  return (
    <div className='min-h-screen flex flex-col'>
        <Navbar/>
        <main className='flex-1 p-4 bg-base-100'>{children}</main>
    </div>
  )
}
