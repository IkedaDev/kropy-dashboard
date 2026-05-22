import type { CollectionConfig } from 'payload'
import { enforceStoreSettingsSingleton } from './hooks/enforceStoreSettingsSingleton'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const StoreSettings: CollectionConfig = {
  slug: 'store-settings',
  labels: {
    singular: {
      es: 'Configuración de Tienda',
      en: 'Store Settings',
    },
    plural: {
      es: 'Configuraciones de Tienda',
      en: 'Store Settings',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
    description: {
      es: 'Configuración general de la tienda del Tenant (despacho). Solo se permite un registro por organización.',
      en: 'General store settings for the Tenant (shipping). Only one record is allowed per organization.',
    },
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
      label: {
        es: 'Nombre de la Tienda',
        en: 'Store Name',
      },
      type: 'text',
      required: true,
      defaultValue: 'Configuración de Tienda',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'shipping',
      label: {
        es: 'Configuración de Envíos y Despacho',
        en: 'Shipping Configuration',
      },
      type: 'group',
      fields: [
        {
          name: 'flatRate',
          label: {
            es: 'Costo Fijo de Despacho',
            en: 'Flat Rate Shipping Cost',
          },
          type: 'number',
          min: 0,
        },
        {
          name: 'description',
          label: {
            es: 'Políticas o Información de Despacho',
            en: 'Shipping Policies or Information',
          },
          type: 'richText',
          localized: true,
        },
      ],
    },
  ],
}
