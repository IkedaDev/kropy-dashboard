import React from 'react'
import { cookies, headers } from 'next/headers'
import NavClient from './NavClient'

export default async function Nav() {
  const cookieStore = await cookies()
  const selectedTenant = cookieStore.get('payload-tenant')?.value || ''

  const reqHeaders = await headers()
  const cookieHeader = reqHeaders.get('cookie') || ''

  let tenants: any[] = []
  let user: any = null

  try {
    const serverUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    
    // Fetch the logged-in user details to verify session
    const meRes = await fetch(`${serverUrl}/api/users/me`, {
      headers: {
        cookie: cookieHeader,
      },
      next: { revalidate: 0 },
    })
    
    if (meRes.ok) {
      const meData = await meRes.json()
      user = meData.user

      if (user) {
        // Fetch tenants (filtered by tenant read access on the server)
        const tenantsRes = await fetch(`${serverUrl}/api/tenants?limit=100`, {
          headers: {
            cookie: cookieHeader,
          },
          next: { revalidate: 0 },
        })
        
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json()
          tenants = tenantsData.docs || []
        }
      }
    }
  } catch (err) {
    console.error('Error fetching auth/tenants on server:', err)
  }

  return (
    <NavClient
      user={user}
      initialSelectedTenant={selectedTenant}
      initialTenants={tenants}
    />
  )
}
