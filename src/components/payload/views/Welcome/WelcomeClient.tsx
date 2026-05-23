'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslation } from '@payloadcms/ui'
import { translations } from './translations'

interface WelcomeClientProps {
  userEmail: string
  userRoles: string[]
  enabledModules?: string[]
}

export default function WelcomeClient({ userEmail, userRoles, enabledModules = ['ecommerce'] }: WelcomeClientProps) {
  const { i18n } = useTranslation()

  const isEn = i18n?.language === 'en'
  const t = isEn ? translations.en : translations.es
  const isSuper = userRoles?.includes('super-admin')
  const isEcommerceEnabled = enabledModules.includes('ecommerce')

  const adminRoute = '/admin'

  const currentDate = new Date().toLocaleDateString(isEn ? 'en-US' : 'es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // List of active cards
  const activeCards = [
    {
      title: t.ecommerceTitle,
      desc: t.ecommerceDesc,
      href: `${adminRoute}/ecommerce-dashboard`,
      icon: (
        <svg className={`w-8 h-8 ${isEcommerceEnabled ? 'text-emerald-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      badge: isEcommerceEnabled ? (isEn ? 'Active' : 'Activo') : (isEn ? 'Not contracted' : 'No contratado'),
      badgeColor: isEcommerceEnabled 
        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
        : 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      gradient: isEcommerceEnabled 
        ? 'from-emerald-500/5 to-teal-500/5 hover:border-emerald-500/50' 
        : 'opacity-50 grayscale cursor-not-allowed hover:border-transparent',
      disabled: !isEcommerceEnabled
    },
    {
      title: t.contentTitle,
      desc: t.contentDesc,
      href: `${adminRoute}/collections/pages`,
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      badge: isEn ? 'Active' : 'Activo',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      gradient: 'from-blue-500/5 to-cyan-500/5 hover:border-blue-500/50'
    },
    {
      title: t.settingsTitle,
      desc: t.settingsDesc,
      href: `${adminRoute}/collections/store-settings`,
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      badge: isEn ? 'Active' : 'Activo',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      gradient: 'from-amber-500/5 to-orange-500/5 hover:border-amber-500/50'
    }
  ]

  // Add super-admin Tenant management card
  if (isSuper) {
    activeCards.push({
      title: t.tenantsTitle,
      desc: t.tenantsDesc,
      href: `${adminRoute}/collections/tenants`,
      icon: (
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <line x1="9" y1="22" x2="9" y2="16" />
          <line x1="15" y1="22" x2="15" y2="16" />
          <line x1="9" y1="16" x2="15" y2="16" />
          <path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 11h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
        </svg>
      ),
      badge: isEn ? 'Super Admin' : 'Super Admin',
      badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      gradient: 'from-indigo-500/5 to-purple-500/5 hover:border-indigo-500/50'
    })
  }

  // Future cards (coming soon)
  const comingSoonCards = [
    {
      title: t.blogTitle,
      desc: t.blogDesc,
      icon: (
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      badge: isEn ? 'Coming Soon' : 'Próximamente',
    },
    {
      title: t.restaurantTitle,
      desc: t.restaurantDesc,
      icon: (
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      badge: isEn ? 'Coming Soon' : 'Próximamente',
    }
  ]

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Welcome Banner Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(20, 184, 166, 0.02) 100%)',
          border: '1px solid var(--theme-border-color)',
          borderRadius: '1.5rem',
          padding: '2.5rem 2rem',
          marginBottom: '2.5rem',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--theme-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {currentDate}
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--theme-elevation-900)', margin: 0 }}>
            {t.title}, <span style={{ color: 'var(--theme-accent)' }}>{userEmail?.split('@')[0] || 'User'}</span> 👋
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--theme-elevation-500)', lineHeight: '1.6', margin: '0.5rem 0 0 0', maxWidth: '800px' }}>
            {t.description}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Panels */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-elevation-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--theme-accent)' }} />
          {t.quickAccess}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {activeCards.map((card, idx) => {
            const innerContent = (
              <div
                style={{
                  background: 'var(--theme-elevation-100)',
                  border: '1px solid var(--theme-border-color)',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.25s ease',
                  cursor: card.disabled ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.01)',
                }}
                className={`hover-card bg-gradient-to-br ${card.gradient}`}
                onMouseEnter={(e) => {
                  if (card.disabled) return
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (card.disabled) return
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0,0,0,0.01)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '0.75rem', backgroundColor: 'var(--theme-elevation-50)', display: 'inline-flex' }}>
                    {card.icon}
                  </div>
                  <span 
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.625rem',
                      borderRadius: '9999px',
                      border: '1px solid currentColor'
                    }}
                    className={card.badgeColor}
                  >
                    {card.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--theme-elevation-900)', margin: 0 }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-500)', lineHeight: '1.5', margin: 0 }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            )

            if (card.disabled) {
              return (
                <div
                  key={idx}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  {innerContent}
                </div>
              )
            }

            return (
              <Link
                key={idx}
                href={card.href}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {innerContent}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Grid: Future Modules (Disabled Styles) */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--theme-elevation-400)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--theme-elevation-300)' }} />
          {isEn ? 'Future Modules' : 'Próximos Módulos'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', opacity: 0.7 }}>
          {comingSoonCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--theme-elevation-50)',
                border: '1px dashed var(--theme-elevation-300)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                cursor: 'not-allowed',
                boxShadow: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.75rem', backgroundColor: 'var(--theme-elevation-100)', display: 'inline-flex' }}>
                  {card.icon}
                </div>
                <span 
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--theme-elevation-150)',
                    color: 'var(--theme-elevation-500)',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--theme-elevation-200)'
                  }}
                >
                  {card.badge}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--theme-elevation-500)', margin: 0 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-400)', lineHeight: '1.5', margin: 0 }}>
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
