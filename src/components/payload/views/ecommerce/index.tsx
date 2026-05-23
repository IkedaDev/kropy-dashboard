import React from 'react'
import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { DefaultTemplate } from '@payloadcms/next/templates'
import DashboardClient from './DashboardClient'

const getLocalizedValue = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    return val.es || val.en || Object.values(val)[0] || ''
  }
  return String(val)
}

export default async function Dashboard({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const user = initPageResult.req.user
  if (!user) {
    return (
      <div className="p-8 text-center bg-[var(--theme-elevation-50)] rounded-2xl border border-[var(--theme-elevation-200)] m-6 font-sans">
        <p className="text-red-500 font-bold text-lg">No estás autenticado.</p>
        <p className="text-sm text-[var(--theme-elevation-400)] mt-2">Inicia sesión para visualizar esta página.</p>
      </div>
    )
  }

  const localeObj = initPageResult.locale
  const localeCode = localeObj && typeof localeObj === 'object' ? (localeObj as any).code : localeObj
  const isEn = localeCode === 'en'

  const sanitizedLocale = localeObj && typeof localeObj === 'object'
    ? {
        code: (localeObj as any).code,
        label: (localeObj as any).label,
        rtl: (localeObj as any).rtl,
      }
    : localeObj

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

  // Check if E-commerce module is enabled for the selected tenant
  let isEcommerceEnabled = true
  let currentTenantObj: any = null

  if (!isGlobal && selectedTenantId) {
    try {
      currentTenantObj = await payload.findByID({
        collection: 'tenants',
        id: selectedTenantId,
        depth: 0,
      })
      if (currentTenantObj && currentTenantObj.enabledModules) {
        isEcommerceEnabled = (currentTenantObj.enabledModules as string[]).includes('ecommerce')
      }
    } catch (err) {
      console.error('Error fetching tenant in ecommerce index:', err)
    }
  }

  if (!isEcommerceEnabled) {
    return (
      <DefaultTemplate
        i18n={initPageResult.req.i18n}
        locale={sanitizedLocale as any}
        params={params}
        payload={initPageResult.req.payload}
        permissions={initPageResult.permissions}
        searchParams={searchParams}
        user={initPageResult.req.user || undefined}
        visibleEntities={initPageResult.visibleEntities}
      >
        <div style={{ padding: '2rem 1.5rem', maxWidth: '800px', margin: '3rem auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <div 
            style={{
              background: 'var(--theme-elevation-100)',
              border: '1px solid var(--theme-border-color)',
              borderRadius: '1.5rem',
              padding: '3rem 2rem',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}
          >
            <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--theme-warning)', display: 'inline-flex' }}>
              <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '64px', height: '64px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--theme-elevation-900)', margin: 0 }}>
              {isEn ? 'Module Not Contracted' : 'Módulo No Contratado'}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--theme-elevation-500)', lineHeight: '1.6', margin: 0, maxWidth: '500px' }}>
              {isEn 
                ? `The E-commerce module is not enabled for the organization "${currentTenantObj?.name || 'this organization'}".`
                : `El módulo de Comercio Electrónico no está habilitado para la organización "${currentTenantObj?.name || 'esta organización'}".`}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-400)', margin: 0 }}>
              {isEn
                ? 'Please contact system administration to activate this service.'
                : 'Por favor, contacta a la administración del sistema para activar este servicio.'}
            </p>
            <Link 
              href="/admin"
              style={{
                marginTop: '1rem',
                backgroundColor: 'var(--theme-accent)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
              }}
            >
              {isEn ? 'Back to Home' : 'Volver al Inicio'}
            </Link>
          </div>
        </div>
      </DefaultTemplate>
    )
  }

  // Fetch available tenants details for selector
  let tenants: any[] = []
  if (isSuper) {
    const res = await payload.find({
      collection: 'tenants',
      limit: 100,
      depth: 0,
    })
    tenants = res.docs
  } else if (tenantIds.length > 0) {
    const res = await payload.find({
      collection: 'tenants',
      where: {
        id: {
          in: tenantIds,
        },
      },
      limit: 100,
      depth: 0,
    })
    tenants = res.docs
  }

  // Construct query filters based on tenant scope
  const tenantFilter: any = {}
  if (!isGlobal && selectedTenantId) {
    tenantFilter.tenant = {
      equals: selectedTenantId,
    }
  }

  // 1. Total Customers Count
  const customersRes = await payload.find({
    collection: 'customers',
    where: tenantFilter,
    limit: 1,
    depth: 0,
  })
  const totalCustomers = customersRes.totalDocs

  // 2. Orders Stats (past 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const ordersFilter = {
    and: [
      tenantFilter,
      {
        createdAt: {
          greater_than_equal: thirtyDaysAgo.toISOString(),
        },
      },
    ],
  }

  const ordersRes = await payload.find({
    collection: 'orders',
    where: ordersFilter,
    limit: 1000,
    depth: 0,
  })

  let totalSales = 0
  let salesOrderCount = 0
  const totalOrdersCount = ordersRes.docs.length

  // Initialize daily sales map for chart (past 7 days)
  const dailySalesMap: { [date: string]: { sales: number; orders: number } } = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateString = d.toISOString().split('T')[0]
    dailySalesMap[dateString] = { sales: 0, orders: 0 }
  }

  ordersRes.docs.forEach((order: any) => {
    const orderTotal = order.total || 0
    const orderStatus = order.status
    const isPaidOrShipped = orderStatus === 'paid' || orderStatus === 'shipped'

    if (isPaidOrShipped) {
      totalSales += orderTotal
      salesOrderCount++
    }

    const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
    if (dailySalesMap[orderDate] !== undefined) {
      dailySalesMap[orderDate].orders++
      if (isPaidOrShipped) {
        dailySalesMap[orderDate].sales += orderTotal
      }
    }
  })

  const averageTicket = salesOrderCount > 0 ? Math.round(totalSales / salesOrderCount) : 0

  const chartData = Object.keys(dailySalesMap)
    .sort()
    .map((date) => {
      const [year, month, day] = date.split('-')
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const formattedDate = `${day} ${monthNames[parseInt(month) - 1]}`
      return {
        date: formattedDate,
        sales: dailySalesMap[date].sales,
        orders: dailySalesMap[date].orders,
      }
    })

  // 3. Recent Orders (last 5)
  const recentOrdersRes = await payload.find({
    collection: 'orders',
    where: tenantFilter,
    sort: '-createdAt',
    limit: 5,
    depth: 0,
  })

  const recentOrders = recentOrdersRes.docs.map((order: any) => ({
    id: String(order.id),
    orderCode: order.orderCode,
    customerEmail: order.customer?.email || 'N/A',
    customerName: order.customer?.name || 'N/A',
    total: order.total || 0,
    status: order.status || 'pending',
    createdAt: order.createdAt,
  }))

  // 4. Low stock products (stock <= 5)
  const lowStockRes = await payload.find({
    collection: 'products',
    where: {
      and: [
        tenantFilter,
        {
          or: [
            {
              and: [
                { hasVariants: { equals: false } },
                { stock: { less_than_equal: 5 } },
              ],
            },
            {
              and: [
                { hasVariants: { equals: true } },
                { 'variants.stock': { less_than_equal: 5 } },
              ],
            },
          ],
        },
      ],
    },
    limit: 20,
    depth: 0,
  })

  const lowStockItems: any[] = []
  lowStockRes.docs.forEach((product: any) => {
    const productTitle = getLocalizedValue(product.title)
    if (product.hasVariants && product.variants) {
      product.variants.forEach((v: any) => {
        if (v.stock <= 5) {
          lowStockItems.push({
            productId: String(product.id),
            productTitle,
            variantName: v.variantName || 'N/A',
            stock: v.stock,
            sku: v.sku || 'N/A',
          })
        }
      })
    } else {
      if (product.stock <= 5) {
        lowStockItems.push({
          productId: String(product.id),
          productTitle,
          variantName: null,
          stock: product.stock,
          sku: 'N/A',
        })
      }
    }
  })

  const mappedTenants = tenants.map((t: any) => ({
    id: String(t.id),
    name: t.name,
    slug: t.slug,
  }))

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={sanitizedLocale as any}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <DashboardClient
        userEmail={user.email}
        tenants={mappedTenants}
        selectedTenantId={selectedTenantId}
        isSuper={isSuper}
        isGlobal={isGlobal}
        stats={{
          totalSales,
          totalOrders: totalOrdersCount,
          averageTicket,
          totalCustomers,
        }}
        chartData={chartData}
        recentOrders={recentOrders}
        lowStockItems={lowStockItems}
      />
    </DefaultTemplate>
  )
}
