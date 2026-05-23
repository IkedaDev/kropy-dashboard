'use client'

import React, { useState } from 'react'

interface ChartDataPoint {
  date: string
  sales: number
  orders: number
}

interface SalesChartProps {
  chartData: ChartDataPoint[]
  t: any
}

export default function SalesChart({ chartData, t }: SalesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value)
  }

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
  const padTop = 15
  const padBottom = 30

  const plotWidth = svgWidth - padLeft - padRight
  const plotHeight = svgHeight - padTop - padBottom

  // Map data to chart coordinates
  const points = chartData.map((d, i) => {
    const x = padLeft + (i / (chartData.length - 1)) * plotWidth
    const y = padTop + plotHeight - (d.sales / yMax) * plotHeight
    return { x, y, data: d }
  })

  // Generate paths
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : ''

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`
    : ''

  return (
    <div className="lg:col-span-2 bg-(--theme-elevation-100) border border-(--theme-elevation-200) rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-(--theme-elevation-900)">
            {t.chartTitle}
          </h2>
          <p className="text-xs text-(--theme-elevation-400)">
            {t.statsRange30}
          </p>
        </div>
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div className="bg-[var(--theme-elevation-150)] px-3 py-1 rounded-lg border border-(--theme-elevation-200) text-xs text-(--theme-elevation-800) font-semibold transition-all">
            {points[hoveredIdx].data.date}: <span className="text-(--theme-accent)">{formatCurrency(points[hoveredIdx].data.sales)}</span> ({points[hoveredIdx].data.orders} {t.chartOrders.toLowerCase()})
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
          {hoveredIdx !== null && points[hoveredIdx] && (
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

          {/* Chart Circles (Nodes) represented as zero-length paths to prevent distortion */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i
            const outerSize = isHovered ? 12 : 8
            const innerSize = isHovered ? 6 : 4
            return (
              <g key={i} className="transition-all duration-150">
                {/* Outer circle (border) */}
                <path
                  d={`M ${p.x} ${p.y} L ${p.x + 0.0001} ${p.y}`}
                  stroke="var(--theme-accent)"
                  strokeWidth={outerSize}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Inner circle (fill) */}
                <path
                  d={`M ${p.x} ${p.y} L ${p.x + 0.0001} ${p.y}`}
                  stroke="var(--theme-elevation-100)"
                  strokeWidth={innerSize}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            )
          })}

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
  )
}
