import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      es: 'Archivo Multimedia',
      en: 'Media File',
    },
    plural: {
      es: 'Archivos Multimedia',
      en: 'Media Files',
    },
  },
  upload: true, 
  admin:{
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
  fields: [], 
}