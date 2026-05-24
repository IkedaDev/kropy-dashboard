'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStepNav, useTranslation, useAuth, NavToggler, useNav } from '@payloadcms/ui'
import iconAsset from '@/assets/icon.svg'

export default function Header() {
  const { stepNav } = useStepNav()
  const { i18n } = useTranslation()
  const { user, logOut } = useAuth()
  const { navOpen } = useNav()
  
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const langRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const isEn = i18n.language === 'en'
  
  const handleLogout = async () => {
    try {
      if (logOut) {
        await logOut()
      } else {
        await fetch('/api/users/logout', { method: 'POST' })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      window.location.href = '/admin/login'
    }
  }

  const getLocalizedLabel = (label: any): string => {
    if (!label) return ''
    if (typeof label === 'string') return label
    if (typeof label === 'object') {
      return label[i18n.language] || label.es || label.en || Object.values(label)[0] || ''
    }
    return String(label)
  }

  // User Initials
  const email = user?.email || ''
  const name = user?.name || email.split('@')[0] || 'User'
  const nameParts = name.trim().split(/\s+/)
  const initials = nameParts.length >= 2
    ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`
    : nameParts[0].charAt(0) || 'U'

  return (
    <header className="kropy-header">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <NavToggler className="kropy-nav-toggler">
          <span className="kropy-toggler-custom-icon">
            {navOpen ? (
              <svg
                className="w-5.5 h-5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v16" />
                <path d="m16 15-3-3 3-3" />
              </svg>
            ) : (
              <svg
                className="w-5.5 h-5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v16" />
                <path d="m13 15 3-3-3-3" />
              </svg>
            )}
          </span>
        </NavToggler>

        {/* Kropy Leaf Icon */}
        <Link href="/admin" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-xl">
            <Image src={iconAsset} alt="Kropy" className="w-5 h-5 object-contain" />
          </div>
        </Link>

        {/* Breadcrumbs / Step Nav */}
        <nav className="flex items-center gap-2">
          {stepNav && stepNav.length > 0 ? (
            stepNav.map((item, index) => {
              const label = getLocalizedLabel(item.label)
              const isLast = index === stepNav.length - 1
              return (
                <React.Fragment key={index}>
                  <span className="text-slate-300 dark:text-neutral-700 font-medium text-xs">/</span>
                  {item.url && !isLast ? (
                    <Link
                      href={item.url}
                      className="text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-emerald-500 transition-colors"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {label}
                    </span>
                  )}
                </React.Fragment>
              )
            })
          ) : (
            <>
              <span className="text-slate-300 dark:text-neutral-700 font-medium text-xs">/</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">
                {isEn ? 'Dashboard' : 'Inicio'}
              </span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="font-mono uppercase">{isEn ? 'EN' : 'ES'}</span>
            <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-1.5 z-[999] overflow-hidden">
              <button
                onClick={() => {
                  (i18n as any).changeLanguage('es')
                  setLangOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between ${!isEn ? 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' : 'text-slate-600 dark:text-neutral-300'}`}
              >
                <span>Español (ES)</span>
                {!isEn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
              <button
                onClick={() => {
                  (i18n as any).changeLanguage('en')
                  setLangOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between ${isEn ? 'text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' : 'text-slate-600 dark:text-neutral-300'}`}
              >
                <span>English (EN)</span>
                {isEn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-0.5 rounded-full border border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition-colors bg-white dark:bg-neutral-900/40 shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs select-none">
              {initials.toUpperCase()}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-3 z-[999] overflow-hidden">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-neutral-800 flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                  {name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 truncate block font-medium">
                  {email}
                </span>
                {user?.roles && user.roles.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {user.roles.map((r: string) => (
                      <span key={r} className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>{isEn ? 'Log Out' : 'Cerrar Sesión'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
