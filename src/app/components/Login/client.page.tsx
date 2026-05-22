'use client'
import type { FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useRef, useState } from 'react'
import Image from 'next/image'
import logo from '@/assets/logo.png'
import './index.scss'

type Props = {
  tenantSlug?: string
  tenantDomain?: string
}

export const Login = ({ tenantSlug, tenantDomain }: Props) => {
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!usernameRef?.current?.value || !passwordRef?.current?.value) {
      setError('Por favor ingresa tu usuario y contraseña.')
      return
    }

    setLoading(true)
    try {
      const actionRes = await fetch('/api/users/external-users/login', {
        body: JSON.stringify({
          password: passwordRef.current.value,
          tenantSlug,
          tenantDomain,
          username: usernameRef.current.value,
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'post',
      })
      const json = await actionRes.json()

      if (actionRes.status === 200 && json.user) {
        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
          router.push(redirectTo)
          return
        } else {
          if (tenantDomain) {
            router.push('/tenant-domains')
          } else {
            router.push(`/tenant-slugs/${tenantSlug}`)
          }
        }
      } else if (actionRes.status === 400 && json?.errors?.[0]?.message) {
        setError(json.errors[0].message)
      } else {
        setError('Nombre de usuario o contraseña incorrectos.')
      }
    } catch (err) {
      setError('Ocurrió un error al intentar iniciar sesión. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Decorative background glow circles matching Kropy theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-md bg-white border border-slate-100/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-3xl p-8 md:p-10 transition-all duration-300">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4 shadow-sm hover:scale-105 transition-transform duration-300">
            <Image 
              src={logo} 
              alt="Kropy Logo" 
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 text-center">
            ¡Hola de nuevo!
          </h2>
          <p className="text-sm text-slate-400 mt-1 text-center font-light">
            Inicia sesión en {tenantSlug ? <span className="font-semibold text-emerald-600 capitalize">{tenantSlug}</span> : 'tu panel'} para continuar.
          </p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5 animate-fadeIn">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              Nombre de Usuario
            </label>
            <div className="relative">
              <input
                name="username"
                ref={usernameRef}
                type="text"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm font-light placeholder-slate-300 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="ej: admin_kropy"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
              Contraseña
            </label>
            <div className="relative">
              <input
                name="password"
                ref={passwordRef}
                type="password"
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm font-light placeholder-slate-300 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_4px_12px_rgba(5,150,105,0.15)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Conectando...</span>
              </>
            ) : (
              <span>Ingresar al Sistema</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-300 mt-8 font-light tracking-wide">
          &copy; {new Date().getFullYear()} Kropy. Todos los derechos reservados.
        </p>

      </div>
    </div>
  )
}
