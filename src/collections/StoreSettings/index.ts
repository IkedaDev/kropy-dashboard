import type { CollectionConfig } from 'payload'
import { enforceStoreSettingsSingleton } from './hooks/enforceStoreSettingsSingleton'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const StoreSettings: CollectionConfig = {
  slug: 'store-settings',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'currency', 'updatedAt'],
    group: 'Ecommerce',
    description: 'Configuración general de la tienda del Tenant (identidad visual, redes sociales, despacho). Solo se permite un registro por organización.',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true, // Permite que el frontend de Astro consuma la configuración libremente
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [enforceStoreSettingsSingleton],
  },
  fields: [
    {
      name: 'name',
      label: 'Nombre de la Tienda',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      label: 'Logotipo de la Tienda',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      label: 'Favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'currency',
      label: 'Moneda Base de Transacciones',
      type: 'select',
      required: true,
      defaultValue: 'CLP',
      options: [
        { label: 'CLP (Pesos Chilenos)', value: 'CLP' },
        { label: 'USD (Dólares Americanos)', value: 'USD' },
        { label: 'EUR (Euros)', value: 'EUR' },
        { label: 'ARS (Pesos Argentinos)', value: 'ARS' },
        { label: 'MXN (Pesos Mexicanos)', value: 'MXN' },
      ],
    },
    {
      name: 'socialLinks',
      label: 'Enlaces a Redes Sociales',
      type: 'group',
      fields: [
        {
          name: 'instagram',
          type: 'text',
          admin: {
            placeholder: 'https://instagram.com/tu-usuario',
          },
        },
        {
          name: 'facebook',
          type: 'text',
          admin: {
            placeholder: 'https://facebook.com/tu-pagina',
          },
        },
        {
          name: 'whatsapp',
          type: 'text',
          label: 'Número de WhatsApp de contacto',
          admin: {
            placeholder: '+56912345678',
          },
        },
        {
          name: 'twitter',
          label: 'Twitter / X',
          type: 'text',
          admin: {
            placeholder: 'https://x.com/tu-usuario',
          },
        },
      ],
    },
    {
      name: 'shipping',
      label: 'Configuración de Envíos y Despacho',
      type: 'group',
      fields: [
        {
          name: 'flatRate',
          label: 'Costo fijo de despacho',
          type: 'number',
          min: 0,
        },
        {
          name: 'description',
          label: 'Políticas o información de despacho',
          type: 'richText',
          localized: true,
        },
      ],
    },
  ],
}
