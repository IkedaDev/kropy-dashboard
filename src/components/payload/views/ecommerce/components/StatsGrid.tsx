import React from 'react'

interface Stats {
  totalSales: number
  totalOrders: number
  averageTicket: number
  totalCustomers: number
}

interface StatsGridProps {
  stats: Stats
  t: any
}

export default function StatsGrid({ stats, t }: StatsGridProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-CL').format(value)
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Sales KPI */}
      <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
            {t.statsSales}
          </span>
          <span className="p-2 bg-emerald-500/10 rounded-lg text-(--theme-accent)">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-(--theme-elevation-900)">
            {formatCurrency(stats.totalSales)}
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {t.statsRange30}
          </span>
        </div>
      </div>

      {/* Total Orders KPI */}
      <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
            {t.statsOrders}
          </span>
          <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-(--theme-elevation-900)">
            {formatNumber(stats.totalOrders)}
          </h3>
          <span className="text-xs text-(--theme-elevation-400) font-medium">
            {t.statsRange30}
          </span>
        </div>
      </div>

      {/* Average Ticket Value */}
      <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
            {t.statsAverageTicket}
          </span>
          <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-(--theme-elevation-900)">
            {formatCurrency(stats.averageTicket)}
          </h3>
          <span className="text-xs text-(--theme-elevation-400) font-medium">
            {t.statsRange30}
          </span>
        </div>
      </div>

      {/* Total Registered Customers */}
      <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
            {t.statsCustomers}
          </span>
          <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold tracking-tight text-(--theme-elevation-900)">
            {formatNumber(stats.totalCustomers)}
          </h3>
          <span className="text-xs text-(--theme-elevation-400) font-medium">
            {t.statsRange30}
          </span>
        </div>
      </div>
    </div>
  )
}
