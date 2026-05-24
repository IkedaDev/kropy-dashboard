'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'

export default function MediaPreview() {
  const { value } = useField<string>({ path: 'url' })
  const [isValidImage, setIsValidImage] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!value) {
      setIsValidImage(false)
      return
    }

    // Verify it starts with a valid protocol
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      setIsValidImage(false)
      return
    }

    setLoading(true)
    const img = new Image()
    img.src = value
    img.onload = () => {
      setIsValidImage(true)
      setLoading(false)
    }
    img.onerror = () => {
      setIsValidImage(false)
      setLoading(false)
    }
  }, [value])

  if (!value) {
    return (
      <div className="media-preview-container empty" style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        border: '2px dashed var(--theme-elevation-200)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'var(--theme-elevation-500)',
        fontSize: '0.9rem'
      }}>
        Introduce un enlace de imagen válido para ver la previsualización aquí.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="media-preview-container loading" style={{
        marginTop: '1.5rem',
        padding: '2rem',
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--theme-elevation-50)',
        color: 'var(--theme-elevation-600)',
        gap: '0.5rem',
        fontSize: '0.9rem'
      }}>
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{
          animation: 'spin 1s linear infinite'
        }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
        </svg>
        Cargando previsualización...
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isValidImage) {
    return (
      <div className="media-preview-container error" style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        border: '1px solid #f87171',
        borderRadius: '12px',
        background: '#fef2f2',
        color: '#b91c1c',
        fontSize: '0.9rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <strong style={{ fontWeight: '600' }}>No se pudo cargar la imagen</strong>
        <span>Verifica que la URL sea una dirección directa de imagen válida y accesible.</span>
      </div>
    )
  }

  return (
    <div className="media-preview-container success" style={{
      marginTop: '1.5rem',
      padding: '1rem',
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: '12px',
      background: 'var(--theme-elevation-50)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxHeight: '350px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid var(--theme-elevation-150)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0.5rem'
      }}>
        <img 
          src={value} 
          alt="Previsualización" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '330px', 
            objectFit: 'contain',
            borderRadius: '4px'
          }} 
        />
      </div>
      <div style={{
        fontSize: '0.8rem',
        color: 'var(--theme-elevation-600)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          display: 'inline-block'
        }}></span>
        Imagen enlazada correctamente
      </div>
    </div>
  )
}
