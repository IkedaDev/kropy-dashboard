import React from 'react'
import Link from 'next/link'

interface LowStockItem {
  productId: string
  productTitle: string
  variantName: string | null
  stock: number
  sku: string
}

interface LowStockProps {
  lowStockItems: LowStockItem[]
  t: any
}

export default function LowStock({ lowStockItems, t }: LowStockProps) {
  return (
    <div className="bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-(--theme-elevation-900) flex items-center gap-2">
          ⚠️ {t.lowStockTitle}
        </h2>
        <p className="text-xs text-(--theme-elevation-400)">
          {t.lowStockSubtitle}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px] pr-1">
        {lowStockItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-6 text-center text-(--theme-elevation-400)">
            <svg className="w-10 h-10 text-emerald-500/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">¡Todo al día!</p>
            <p className="text-[10px]">{t.emptyStock}</p>
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
                    {t.lowStockVariant}: {item.variantName}
                  </span>
                ) : null}
                <span className="text-[9px] text-(--theme-elevation-400) font-mono block">
                  {t.lowStockSKU}: {item.sku}
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
  )
}
