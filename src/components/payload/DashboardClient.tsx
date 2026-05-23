'use client'

import React, { useState } from 'react'
import Link from 'next/link'

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

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

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    document.cookie = `payload-tenant=${val}; path=/; max-age=7200`
    window.location.reload()
  }

  // Chart setup
  const maxSales = Math.max(...chartData.map((d) => d.sales), 1000)
  const roundUpMax = (val: number) => {
    if (val <= 1000) return 1000
    const order = Math.pow(10, Math.floor(Math.log10(val)))
    const normalized = val / order
    const rounded = Math.ceil(normalized * 2) / 2 // round to nearest 0.5
    return rounded * order
  }
  const yMax = roundUpMax(maxSales)

  // Chart ViewBox coordinates
  const svgWidth = 600
  const svgHeight = 220
  const padLeft = 65
  const padRight = 20
  const padTop = 20
  const padBottom = 35
  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  // Map data to SVG points
  const points = chartData.map((d, i) => {
    const x = padLeft + (i / (chartData.length - 1)) * plotWidth
    const y = padTop + plotHeight - (d.sales / yMax) * plotHeight
    return { x, y, data: d }
  })

  // Construct SVG paths
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`
    : ''

  // Format Status Badges
  const renderStatusBadge = (status: string) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-colors duration-150'
    let badgeColor = ''
    let dotColor = ''
    let label = ''

    switch (status) {
      case 'paid':
        badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        dotColor = 'bg-emerald-500'
        label = 'Pagado'
        break
      case 'shipped':
        badgeColor = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
        dotColor = 'bg-sky-500'
        label = 'Enviado'
        break
      case 'pending':
        badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        dotColor = 'bg-amber-500'
        label = 'Pendiente'
        break
      case 'cancelled':
        badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        dotColor = 'bg-rose-500'
        label = 'Cancelado'
        break
      default:
        badgeColor = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
        dotColor = 'bg-slate-500'
        label = status
    }

    return (
      <span className={`${baseStyles} ${badgeColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} mr-1.5 shrink-0`} />
        {label}
      </span>
    )
  }

  return (
    <div className="bg-(--theme-elevation-0) py-8 px-4 sm:px-6 lg:px-8 font-sans ">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-(--theme-elevation-200)">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--theme-elevation-900)">
            Resumen de Ventas y Analítica
          </h1>
          <p className="mt-1 text-sm text-(--theme-elevation-400)">
            Monitorea el rendimiento de tus tiendas en tiempo real. Bienvenido, <span className="font-semibold text-(--theme-accent)">{userEmail}</span>.
          </p>
        </div>

        {/* Tenant selector */}
        {tenants.length > 0 && (
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
              Organización / Tienda:
            </label>
            <div className="relative">
              <select
                value={selectedTenantId || 'global'}
                onChange={handleTenantChange}
                className="appearance-none w-64 bg-(--theme-elevation-100) border border-(--theme-elevation-200) text-(--theme-elevation-800) px-4 py-2.5 rounded-xl font-medium focus:outline-none focus:border-[var(--theme-accent)] focus:ring-2 focus:ring-emerald-500/10 cursor-pointer shadow-sm pr-10"
              >
                {isSuper && (
                  <option value="global">
                    🌐 Global (Todas las tiendas)
                  </option>
                )}
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    🏪 {t.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-(--theme-elevation-400)">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Sales KPI */}
        <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
              Ventas Totales (30d)
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
              Ventas pagadas / despachadas
            </span>
          </div>
        </div>

        {/* Total Orders KPI */}
        <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
              Cantidad de Pedidos (30d)
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
              Pedidos totales en el periodo
            </span>
          </div>
        </div>

        {/* Average Ticket Value */}
        <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
              Ticket Promedio
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
              Ventas / Cantidad de pedidos
            </span>
          </div>
        </div>

        {/* Total Registered Customers */}
        <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-(--theme-elevation-400)">
              Clientes Registrados
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
              Clientes totales registrados
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Side Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Sales Chart Section */}
        <div className="lg:col-span-2 bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-(--theme-elevation-900)">
                Tendencia de Ventas Diarias
              </h2>
              <p className="text-xs text-(--theme-elevation-400)">
                Historial de facturación de los últimos 7 días
              </p>
            </div>
            {hoveredIdx !== null && (
              <div className="bg-[var(--theme-elevation-150)] px-3 py-1 rounded-lg border border-(--theme-elevation-200) text-xs text-(--theme-elevation-800) font-semibold transition-all">
                {points[hoveredIdx].data.date}: <span className="text-(--theme-accent)">{formatCurrency(points[hoveredIdx].data.sales)}</span> ({points[hoveredIdx].data.orders} ped.)
              </div>
            )}
          </div>

          {/* SVG Pure Chart with crisp HTML axis text */}
          <div className="relative w-full h-[220px]">
            {/* Y Axis Labels (HTML) */}
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const top = padTop + r * plotHeight
              const gridVal = yMax * (1 - r)
              return (
                <div
                  key={i}
                  className="absolute left-0 text-[10px] font-bold text-(--theme-elevation-400) select-none pointer-events-none antialiased"
                  style={{
                    top: `${top}px`,
                    transform: 'translateY(-50%)',
                    width: `${padLeft - 10}px`,
                    textAlign: 'right',
                  }}
                >
                  {formatCurrency(gridVal)}
                </div>
              )
            })}

            {/* X Axis Labels (HTML) */}
            {points.map((p, i) => {
              const leftPercent = (p.x / svgWidth) * 100
              return (
                <div
                  key={i}
                  className="absolute text-[10px] font-bold text-(--theme-elevation-400) select-none pointer-events-none antialiased text-center"
                  style={{
                    left: `${leftPercent}%`,
                    bottom: '8px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  {p.data.date}
                </div>
              )
            })}

            <svg
              className="w-full h-full"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                const y = padTop + r * plotHeight
                return (
                  <line
                    key={i}
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="var(--theme-elevation-200)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )
              })}

              {/* Shaded Area under Curve */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#chartGradient)"
                />
              )}

              {/* Line path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--theme-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Vertical line on hover */}
              {hoveredIdx !== null && (
                <line
                  x1={points[hoveredIdx].x}
                  y1={padTop}
                  x2={points[hoveredIdx].x}
                  y2={padTop + plotHeight}
                  stroke="var(--theme-accent)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Chart Circles (Nodes) */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === i ? 6 : 4}
                  fill="var(--theme-elevation-100)"
                  stroke="var(--theme-accent)"
                  strokeWidth={hoveredIdx === i ? 3 : 2}
                  className="transition-all duration-150 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}

              {/* Invisible Columns for Hover Detection */}
              {points.map((p, i) => {
                const colWidth = plotWidth / (chartData.length - 1)
                const startX = p.x - colWidth / 2
                return (
                  <rect
                    key={i}
                    x={startX}
                    y={padTop}
                    width={colWidth}
                    height={plotHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                )
              })}
            </svg>
          </div>
        </div>

        {/* Stock Warnings Sidebar */}
        <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-(--theme-elevation-900) flex items-center gap-2">
              ⚠️ Alertas de Inventario
            </h2>
            <p className="text-xs text-(--theme-elevation-400)">
              Productos y variantes con stock crítico (5 unidades o menos)
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px] pr-1">
            {lowStockItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-6 text-center text-(--theme-elevation-400)">
                <svg className="w-10 h-10 text-emerald-500/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">¡Todo al día!</p>
                <p className="text-[10px]">No hay productos con stock crítico</p>
              </div>
            ) : (
              lowStockItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 rounded-xl flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <Link
                      href={`/admin/collections/products/${item.productId}`}
                      className="text-xs font-bold text-(--theme-elevation-800) hover:text-(--theme-accent) transition-colors block truncate"
                    >
                      {item.productTitle}
                    </Link>
                    {item.variantName ? (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium block">
                        Variante: {item.variantName}
                      </span>
                    ) : null}
                    <span className="text-[9px] text-(--theme-elevation-400) font-mono block">
                      SKU: {item.sku}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                      {item.stock} un.
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <div>
            <h2 className="text-lg font-bold text-(--theme-elevation-900)">
              Órdenes de Compra Recientes
            </h2>
            <p className="text-xs text-(--theme-elevation-400)">
              Visualiza y gestiona las últimas 5 transacciones registradas
            </p>
          </div>
          <Link
            href="/admin/collections/orders"
            className="self-start text-xs font-bold text-(--theme-accent) hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            Ver todas las órdenes
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-(--theme-elevation-400)">
            <svg className="w-12 h-12 mx-auto text-[var(--theme-elevation-200)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-semibold">No se encontraron órdenes</p>
            <p className="text-xs">Aún no hay transacciones en el sistema para esta tienda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--theme-elevation-200)] text-left">
              <thead>
                <tr className="bg-[var(--theme-elevation-50)]">
                  <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                    Código Orden
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                    Cliente
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                    Fecha
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)] text-right">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)] text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--theme-elevation-200)]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--theme-elevation-50)] transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-(--theme-elevation-900)">
                      {order.orderCode}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-(--theme-elevation-800)">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-xs text-(--theme-elevation-400)">{order.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-(--theme-elevation-400) font-medium">
                      {new Date(order.createdAt).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-(--theme-elevation-900) text-right">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-center">
                      <Link
                        href={`/admin/collections/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-(--theme-accent) hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                      >
                        Ver Detalle
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
