import React from 'react'
import type { AdminViewServerProps } from 'payload'
import WelcomeClient from './WelcomeClient'

export default async function WelcomeDashboard({ initPageResult }: AdminViewServerProps) {
  const user = initPageResult?.req?.user

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--theme-elevation-50)', borderRadius: '1.25rem', border: '1px solid var(--theme-border-color)', margin: '1.5rem', fontFamily: 'sans-serif' }}>
        <p style={{ color: 'red', fontWeight: 'bold', fontSize: '1.125rem' }}>No estás autenticado.</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-400)', marginTop: '0.5rem' }}>Inicia sesión para visualizar esta página.</p>
      </div>
    )
  }

  return (
    <WelcomeClient
      userEmail={user.email}
      userRoles={user.roles || []}
    />
  )
}
