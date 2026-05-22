'use client'
import React, { useEffect } from 'react'

export default function ForceThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inject Plus Jakarta Sans Google Font link dynamically
    if (typeof window !== 'undefined' && !document.getElementById('kropy-google-font')) {
      const link = document.createElement('link')
      link.id = 'kropy-google-font'
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap'
      document.head.appendChild(link)
    }
  }, [])

  return <>{children}</>
}

