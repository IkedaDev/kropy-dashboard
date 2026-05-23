import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import DashboardClient from './DashboardClient'

const getLocalizedValue = (val: any): string => {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    return val.es || val.en || Object.values(val)[0] || ''
  }
  return String(val)
}

export default async function Dashboard({ initPageResult }: AdminViewServerProps) {
  const user = initPageResult.req.user
  if (!user) {
    return (
      <div className="p-8 text-center bg-[var(--theme-elevation-50)] rounded-2xl border border-[var(--theme-elevation-200)] m-6 font-sans">
        <p className="text-red-500 font-bold text-lg">No estás autenticado.</p>
        <p className="text-sm text-[var(--theme-elevation-400)] mt-2">Inicia sesión para visualizar esta página.</p>
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
  )
}
