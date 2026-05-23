import React from 'react'
import Link from 'next/link'

interface Order {
  id: string
  orderCode: string
  customerEmail: string
  customerName: string
  total: number
  status: string
  createdAt: string
}

interface RecentOrdersProps {
  recentOrders: Order[]
  t: any
}

export default function RecentOrders({ recentOrders, t }: RecentOrdersProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const renderStatusBadge = (status: string) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-colors duration-150'
    let badgeColor = ''
    let dotColor = ''
    let label = ''

    switch (status) {
      case 'paid':
        badgeColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        dotColor = 'bg-emerald-500'
        label = t.statusPaid
        break
      case 'shipped':
        badgeColor = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
        dotColor = 'bg-sky-500'
        label = t.statusShipped
        break
      case 'pending':
        badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
        dotColor = 'bg-amber-500'
        label = t.statusPending
        break
      case 'cancelled':
        badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
        dotColor = 'bg-rose-500'
        label = t.statusCancelled
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
    <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
        <div>
          <h2 className="text-lg font-bold text-(--theme-elevation-900)">
            {t.recentOrdersTitle}
          </h2>
          <p className="text-xs text-(--theme-elevation-400)">
            {t.subtitle}
          </p>
        </div>
        <Link
          href="/admin/collections/orders"
          className="self-start text-xs font-bold text-(--theme-accent) hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
        >
          {t.recentOrdersViewAll}
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
          <p className="text-sm font-semibold">{t.emptyOrders}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--theme-elevation-200)] text-left">
            <thead>
              <tr className="bg-[var(--theme-elevation-50)]">
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                  {t.recentOrdersCode}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                  {t.recentOrdersCustomer}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                  {t.recentOrdersDate}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)]">
                  {t.recentOrdersStatus}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)] text-right">
                  {t.recentOrdersTotal}
                </th>
                <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--theme-elevation-500)] text-center">
                  {t.lowStockAction}
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
                    {new Date(order.createdAt).toLocaleDateString(t.locale === 'es' ? 'es-CL' : 'en-US', {
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
                      {t.recentOrdersViewAll.split(' ')[0]}
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
  )
}
