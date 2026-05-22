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
    defaultColumns: ['name', 'currency', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
    description: {
      es: 'Configuración general de la tienda del Tenant (identidad visual, redes sociales, despacho). Solo se permite un registro por organización.',
      en: 'General store settings for the Tenant (visual identity, social networks, shipping). Only one record is allowed per organization.',
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
    },
    {
      name: 'logo',
      label: {
        es: 'Logotipo de la Tienda',
        en: 'Store Logo',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      label: {
        es: 'Favicon',
        en: 'Favicon',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'currency',
      label: {
        es: 'Moneda Base de Transacciones',
        en: 'Base Transaction Currency',
      },
      type: 'select',
      required: true,
      defaultValue: 'CLP',
      options: [
        { label: { es: 'CLP (Pesos Chilenos)', en: 'CLP (Chilean Pesos)' }, value: 'CLP' },
        { label: { es: 'USD (Dólares Americanos)', en: 'USD (US Dollars)' }, value: 'USD' },
        { label: { es: 'EUR (Euros)', en: 'EUR (Euros)' }, value: 'EUR' },
        { label: { es: 'ARS (Pesos Argentinos)', en: 'ARS (Argentine Pesos)' }, value: 'ARS' },
        { label: { es: 'MXN (Pesos Mexicanos)', en: 'MXN (Mexican Pesos)' }, value: 'MXN' },
      ],
    },
    {
      name: 'socialLinks',
      label: {
        es: 'Enlaces a Redes Sociales',
        en: 'Social Media Links',
      },
      type: 'group',
      fields: [
        {
          name: 'instagram',
          label: {
            es: 'Instagram',
            en: 'Instagram',
          },
          type: 'text',
          admin: {
            placeholder: 'https://instagram.com/tu-usuario',
          },
        },
        {
          name: 'facebook',
          label: {
            es: 'Facebook',
            en: 'Facebook',
          },
          type: 'text',
          admin: {
            placeholder: 'https://facebook.com/tu-pagina',
          },
        },
        {
          name: 'whatsapp',
          type: 'text',
          label: {
            es: 'Número de WhatsApp de Contacto',
            en: 'Contact WhatsApp Number',
          },
          admin: {
            placeholder: '+56912345678',
          },
        },
        {
          name: 'twitter',
          label: {
            es: 'Twitter / X',
            en: 'Twitter / X',
          },
          type: 'text',
          admin: {
            placeholder: 'https://x.com/tu-usuario',
          },
        },
      ],
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
