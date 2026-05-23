'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, useTranslation, useNav, NavToggler } from '@payloadcms/ui'
import Logo from './Logo'
import Icon from './Icon'
import {
  DashboardIcon,
  PagesIcon,
  MediaIcon,
  OrdersIcon,
  ProductsIcon,
  CategoriesIcon,
  BrandsIcon,
  CustomersIcon,
  DiscountsIcon,
  ReviewsIcon,
  UsersIcon,
  SettingsIcon,
  TenantsIcon,
  LogoutIcon,
} from './Icons'

export default function Nav() {
  const pathname = usePathname()
  const { user, logOut } = useAuth()
  const { i18n } = useTranslation()
  const { navOpen } = useNav()

  const adminRoute = '/admin'
  const isSuper = user?.roles?.includes('super-admin')
  const handleLogout = async () => {
    try {
      if (logOut) {
        await logOut()
      } else {
        await fetch('/api/users/logout', { method: 'POST' })
      }
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      // Force a full window reload and redirect to the login page to ensure Next.js router cache is fully invalidated
      window.location.href = `${adminRoute}/login`
    }
  }

  const [tenants, setTenants] = useState<any[]>([])
  const [selectedTenant, setSelectedTenant] = useState('')
  const [loadingTenants, setLoadingTenants] = useState(true)

  useEffect(() => {
    // Get the selected tenant from cookie
    const getTenantCookie = () => {
      if (typeof document === 'undefined') return ''
      const match = document.cookie.match(/payload-tenant=([^;]+)/)
      return match ? match[1] : ''
    }
    setSelectedTenant(getTenantCookie())

    // Fetch tenants for all authenticated users (filtered by tenant read access on server)
    if (user) {
      setLoadingTenants(true)
      fetch('/api/tenants?limit=100')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.docs) {
            setTenants(data.docs)
          }
          setLoadingTenants(false)
        })
        .catch((err) => {
          console.error('Error fetching tenants:', err)
          setLoadingTenants(false)
        })
    } else {
      setLoadingTenants(false)
    }
  }, [user])

  const isModuleEnabled = (moduleKey: string) => {
    if (selectedTenant === 'global' || !selectedTenant) {
      return true
    }
    const activeTenantObj = tenants.find((t) => String(t.id) === String(selectedTenant))
    if (!activeTenantObj) {
      // If loading or tenant not found yet, default to true to prevent screen flicker
      return true
    }
    // If enabledModules is not set or empty, default to 'ecommerce' for safety
    if (!activeTenantObj.enabledModules) {
      return moduleKey === 'ecommerce'
    }
    return activeTenantObj.enabledModules.includes(moduleKey)
  }

  const handleTenantChange = (val: string) => {
    document.cookie = `payload-tenant=${val}; path=/; max-age=7200`
    setSelectedTenant(val)
    window.location.reload()
  }

  const isLinkActive = (href: string) => {
    if (href === adminRoute) {
      return pathname === adminRoute || pathname === `${adminRoute}/`
    }
    return pathname.startsWith(href)
  }

  interface NavLink {
    label: { es: string; en: string }
    href: string
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    superAdminOnly?: boolean
  }

  interface NavGroup {
    label: { es: string; en: string }
    links: NavLink[]
    module?: string
  }

  const groups: NavGroup[] = [
    {
      label: { es: 'Inicio', en: 'Home' },
      links: [
        { label: { es: 'Dashboard', en: 'Dashboard' }, href: adminRoute, icon: DashboardIcon },
      ],
    },
    {
      label: { es: 'Contenido', en: 'Content' },
      links: [
        { label: { es: 'Páginas', en: 'Pages' }, href: `${adminRoute}/collections/pages`, icon: PagesIcon },
        { label: { es: 'Archivos', en: 'Media' }, href: `${adminRoute}/collections/media`, icon: MediaIcon },
      ],
    },
    {
      label: { es: 'Comercio Electrónico', en: 'E-Commerce' },
      module: 'ecommerce',
      links: [
        { label: { es: 'Dashboard', en: 'Dashboard' }, href: `${adminRoute}/ecommerce-dashboard`, icon: DashboardIcon },
        { label: { es: 'Órdenes', en: 'Orders' }, href: `${adminRoute}/collections/orders`, icon: OrdersIcon },
        { label: { es: 'Productos', en: 'Products' }, href: `${adminRoute}/collections/products`, icon: ProductsIcon },
        { label: { es: 'Categorías', en: 'Categories' }, href: `${adminRoute}/collections/categories`, icon: CategoriesIcon },
        { label: { es: 'Marcas', en: 'Brands' }, href: `${adminRoute}/collections/brands`, icon: BrandsIcon },
        { label: { es: 'Clientes', en: 'Customers' }, href: `${adminRoute}/collections/customers`, icon: CustomersIcon },
        { label: { es: 'Cupones', en: 'Coupons' }, href: `${adminRoute}/collections/discounts`, icon: DiscountsIcon },
        { label: { es: 'Reseñas', en: 'Product Reviews' }, href: `${adminRoute}/collections/product-reviews`, icon: ReviewsIcon },
        { label: { es: 'Usuarios', en: 'Users' }, href: `${adminRoute}/collections/users`, icon: UsersIcon },
        { label: { es: 'Ajustes de Tienda', en: 'Store Settings' }, href: `${adminRoute}/collections/store-settings`, icon: SettingsIcon },
      ],
    },
    {
      label: { es: 'Configuración', en: 'Settings' },
      links: [
        { label: { es: 'Organizaciones', en: 'Organizations' }, href: `${adminRoute}/collections/tenants`, icon: TenantsIcon, superAdminOnly: true },
      ],
    },
  ]

  const isEn = i18n?.language === 'en'

  return (
    <aside className={`aside-nav ${navOpen ? 'nav--open' : 'nav--closed'}`}>
      <div className="nav__wrap">
        <div className="nav__header">
          <Link href={adminRoute} className="nav__logo">
            <Logo />
          </Link>
          <div className="nav__icon" style={{ display: 'none' }}>
            <Link href={adminRoute}>
              <Icon />
            </Link>
          </div>
          <NavToggler className="nav__header-toggle" />
        </div>

        {/* Super-admin Tenant Selector (reserved space via container minHeight) */}
        {isSuper && (
          <div className="nav__tenant-select-container" style={{ minHeight: '62px', padding: '0 0.5rem', marginBottom: '1.5rem' }}>
            <label className="nav__tenant-label" style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--theme-elevation-400)', marginBottom: '0.5rem', display: 'block' }}>
              {isEn ? 'Organization' : 'Organización'}
            </label>
            <div className="nav__tenant-select-wrapper" style={{ position: 'relative' }}>
              {loadingTenants ? (
                <div
                  style={{
                    height: '38px',
                    backgroundColor: 'var(--theme-elevation-100)',
                    border: '1px solid var(--theme-elevation-200)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '0.75rem',
                    color: 'var(--theme-elevation-400)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    opacity: 0.6
                  }}
                >
                  {isEn ? 'Loading organizations...' : 'Cargando organizaciones...'}
                </div>
              ) : (
                <select
                  value={selectedTenant || 'global'}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="nav__tenant-select"
                  style={{
                    appearance: 'none',
                    width: '100%',
                    backgroundColor: 'var(--theme-elevation-100)',
                    border: '1px solid var(--theme-elevation-200)',
                    color: 'var(--theme-text)',
                    padding: '0.625rem 2rem 0.625rem 0.75rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="global">
                    🌐 {isEn ? 'Global (All stores)' : 'Global (Todas las tiendas)'}
                  </option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      🏪 {t.name}
                    </option>
                  ))}
                </select>
              )}
              {!loadingTenants && (
                <div className="nav__tenant-select-icon" style={{ pointerEvents: 'none', position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', color: 'var(--theme-elevation-400)', display: 'flex', alignItems: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="nav__scroll">
          <div style={{ flex: 1 }}>
            {groups.map((group, gIdx) => {
              // Filter out the group if its associated module is not enabled for the selected tenant
              if (group.module && !isModuleEnabled(group.module)) {
                return null
              }

              const visibleLinks = group.links.filter(link => !link.superAdminOnly || isSuper)
              if (visibleLinks.length === 0) return null

              return (
                <div key={gIdx} className="nav-group">
                  <div className="nav-group__toggle" style={{ cursor: 'default' }}>
                    <span className="nav-group__label">
                      {isEn ? group.label.en : group.label.es}
                    </span>
                  </div>
                  <div className="nav-group__links">
                    {visibleLinks.map((link, lIdx) => {
                      const active = isLinkActive(link.href)
                      return (
                        <Link
                          key={lIdx}
                          href={link.href}
                          className="nav__link"
                          style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                        >
                          <link.icon style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                          <span>{isEn ? link.label.en : link.label.es}</span>
                          {active && <span className="nav__link-indicator" />}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          
        </div>
        {/* Sidebar Footer with user info & logout */}
          {user && (
            <div className="nav__footer" style={{ borderTop: '1px solid var(--theme-elevation-200)', paddingTop: '1rem', marginTop: '1rem' }}>
              {/* <div className="nav__user-email" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--theme-elevation-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 0.75rem', marginBottom: '0.5rem' }} title={user.email}>
                {user.email}
              </div> */}
              <button
                onClick={() => handleLogout()}
                className="nav__link logout"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 'calc(100% - 1.5rem)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogoutIcon style={{ marginRight: '0.75rem', flexShrink: 0 }} />
                <span>{isEn ? 'Log Out' : 'Cerrar Sesión'}</span>
              </button>
            </div>
          )}
      </div>
    </aside>
  )
}
