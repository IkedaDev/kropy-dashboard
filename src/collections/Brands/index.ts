import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: {
    singular: {
      es: 'Marca',
      en: 'Brand',
    },
    plural: {
      es: 'Marcas',
      en: 'Brands',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'name',
      label: {
        es: 'Nombre de la Marca',
        en: 'Brand Name',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      label: {
        es: 'Logotipo de la Marca',
        en: 'Brand Logo',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      label: {
        es: 'Descripción de la Marca',
        en: 'Brand Description',
      },
      type: 'richText',
      localized: true,
    },
  ],
}

