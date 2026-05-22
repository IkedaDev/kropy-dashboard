import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    group: 'Ecommerce',
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
      label: 'Nombre de la Marca',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      label: 'Logotipo de la Marca',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      label: 'Descripción de la Marca',
      type: 'richText',
      localized: true,
    },
  ],
}
