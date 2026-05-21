import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true, 
  admin:{
    group: 'Ecommerce',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true, 
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [], 
}