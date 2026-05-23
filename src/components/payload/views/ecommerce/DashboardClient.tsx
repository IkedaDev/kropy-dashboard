'use client'

import React from 'react'
import { useTranslation } from '@payloadcms/ui'
import { translations } from './translations'
import StatsGrid from './components/StatsGrid'
import SalesChart from './components/SalesChart'
import RecentOrders from './components/RecentOrders'
import LowStock from './components/LowStock'

interface Tenant {
  id: string
  name: string
  slug: string
}

interface Stat {
  totalSales: number
  totalOrders: number
  averageTicket: number
  totalCustomers: number
}

interface ChartDataPoint {
  date: string
  sales: number
  orders: number
}

interface RecentOrder {
  id: string
  orderCode: string
  customerEmail: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface LowStockItem {
  productId: string
  productTitle: string
  variantName: string | null
  stock: number
  sku: string
}

interface DashboardClientProps {
  userEmail: string
  tenants: Tenant[]
  selectedTenantId: string
  isSuper: boolean
  isGlobal: boolean
  stats: Stat
  chartData: ChartDataPoint[]
  recentOrders: RecentOrder[]
  lowStockItems: LowStockItem[]
}

export default function DashboardClient({
  userEmail,
  tenants,
  selectedTenantId,
  isSuper,
  isGlobal,
  stats,
  chartData,
  recentOrders,
  lowStockItems,
}: DashboardClientProps) {
  const { i18n } = useTranslation()

  const isEn = i18n?.language === 'en'
  const t = isEn ? translations.en : translations.es

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    document.cookie = `payload-tenant=${val}; path=/; max-age=7200`
    window.location.reload()
  }

  return (
    <div className="bg-(--theme-elevation-0) py-8 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-(--theme-elevation-200) gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--theme-elevation-900)">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-(--theme-elevation-400)">
            {t.subtitle} {t.welcome} <span className="font-semibold text-(--theme-accent)">{userEmail}</span>.
          </p>
        </div>

        {/* Tenant selector */}
        {tenants.length > 0 && (
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
              {t.tenantLabel}
            </label>
            <div className="relative">
              <select
                value={selectedTenantId || 'global'}
                onChange={handleTenantChange}
                className="appearance-none w-64 bg-[var(--theme-elevation-100)] border border-[var(--theme-elevation-200)] text-[var(--theme-elevation-800)] px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-sm pr-10"
              >
                {isSuper && (
                  <option value="global">
                    {t.tenantGlobal}
                  </option>
                )}
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    🏪 {t.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--theme-elevation-400)]">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <StatsGrid stats={stats} t={t} />

      {/* Main Charts & Side Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <SalesChart chartData={chartData} t={t} />
        <LowStock lowStockItems={lowStockItems} t={t} />
      </div>

      {/* Recent Orders Section */}
      <RecentOrders recentOrders={recentOrders} t={t} />
    </div>
  )
}
