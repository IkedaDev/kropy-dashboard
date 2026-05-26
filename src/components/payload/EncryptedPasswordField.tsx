'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

interface FieldProps {
  path: string
  field: {
    label?: {
      es?: string
      en?: string
    } | string
    admin?: {
      description?: {
        es?: string
        en?: string
      } | string
    }
  }
}

export default function EncryptedPasswordField({ path, field }: FieldProps) {
  const { value, setValue } = useField<string>({ path })

  // Extract translation or label
  const labelText = typeof field?.label === 'object'
    ? (field.label.es || field.label.en)
    : (field?.label || 'Clave Secreta')

  const descriptionText = typeof field?.admin?.description === 'object'
    ? (field.admin.description.es || field.admin.description.en)
    : field?.admin?.description

  return (
    <div className="field-type text" style={{ marginBottom: '1.5rem' }}>
      <label className="field-label" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
        {labelText}
      </label>
      <input
        type="password"
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '4px',
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-elevation-800)',
          fontSize: '1rem',
        }}
        autoComplete="new-password"
      />
      {descriptionText && (
        <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)', marginTop: '0.25rem' }}>
          {descriptionText}
        </div>
      )}
    </div>
  )
}
