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
                className="w-6 h-6"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v16" />
                <path d="m16 15-3-3 3-3" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="#0f172a"
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
        {/* <Link href="/admin" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-xl">
            <Image src={iconAsset} alt="Kropy" className="w-5 h-5 object-contain" />
          </div>
        </Link> */}

        {/* Breadcrumbs / Step Nav */}
        {/* <nav className="flex items-center gap-2">
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
                      className="text-xs font-semibold text-slate-500  dark:text-neutral-400 hover:text-emerald-500 transition-colors"
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
        </nav> */}
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector Dropdown */}
        <div className="relative " ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="kropy-lang-btn w-20 h-10 px-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="font-mono uppercase">{isEn ? 'EN' : 'ES'}</span>
            <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langOpen && (
            <div className="kropy-dropdown-menu w-45 flex flex-col">
              <button
                onClick={() => {
                  (i18n as any).changeLanguage('es')
                  setLangOpen(false)
                }}
                className={`kropy-menu-item ${!isEn ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}
              >
                <div className=' flex justify-between items-center gap-4'>
                  <span>Español (ES)</span>
                  {!isEn && (
                    <svg className="w-4 h-4 text-emerald-500 mx-auto" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
              <button
                onClick={() => {
                  (i18n as any).changeLanguage('en')
                  setLangOpen(false)
                }}
                className={`kropy-menu-item ${isEn ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}
              >
                <div className=''>
                  <span>English (EN)</span>
                  {isEn && (
                    <svg className="w-3.5 h-3.5 text-emerald-500 ml-auto" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="kropy-user-avatar-btn"
          >
            <div className="kropy-avatar-box">
              {initials.toUpperCase()}
            </div>
          </button>

          {profileOpen && (
            <div className="kropy-dropdown-menu w-82">
              {/* Profile Header */}
              <div className="kropy-profile-header">
                <div className="kropy-avatar-large">
                  {initials.toUpperCase()}
                </div>
                <div className="kropy-user-info">
                  <span className="kropy-user-name">
                    {name}
                  </span>
                  <span className="kropy-user-email">
                    {email}
                  </span>
                </div>
              </div>

              {/* Roles Section */}
              {user?.roles && user.roles.length > 0 && (
                <div className="kropy-profile-roles">
                  {user.roles.map((r: string) => (
                    <span key={r} className="kropy-role-badge">
                      {r}
                    </span>
                  ))}
                </div>
              )}

              {/* Menu Links */}
              <div className="py-1 flex flex-col">
                <Link
                  href="/admin/account"
                  className="kropy-menu-item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>{isEn ? 'My Account' : 'Mi Cuenta'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="kropy-menu-item kropy-logout-item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
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
