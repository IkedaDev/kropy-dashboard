import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
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

  const payload = await getPayload({ config: configPromise })
  const cookieStore = await cookies()
  const isSuper = isSuperAdmin(user)
  const tenantIds = getUserTenantIDs(user)

  // Resolve selected tenant
  let selectedTenantId = cookieStore.get('payload-tenant')?.value || ''
  if (!isSuper) {
    if (!selectedTenantId || !tenantIds.map(String).includes(selectedTenantId)) {
      selectedTenantId = tenantIds[0] ? String(tenantIds[0]) : ''
    }
  }

  const isGlobal = isSuper && (!selectedTenantId || selectedTenantId === 'global')

  let enabledModules: string[] = ['ecommerce'] // Default

  if (!isGlobal && selectedTenantId) {
    try {
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: selectedTenantId,
        depth: 0,
      })
      if (tenant && tenant.enabledModules) {
        enabledModules = tenant.enabledModules as string[]
      }
    } catch (err) {
      console.error('Error fetching tenant in Welcome view:', err)
    }
  }

  return (
    <WelcomeClient
      userEmail={user.email}
      userRoles={user.roles || []}
      enabledModules={enabledModules}
    />
  )
}

