import type { CollectionConfig } from 'payload'

import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      es: 'Página',
      en: 'Page',
    },
    plural: {
      es: 'Páginas',
      en: 'Pages',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
    group: {
      es: 'Contenido',
      en: 'Content',
    },
  },
  fields: [
    {
      name: 'title',
      label: {
        es: 'Título',
        en: 'Title',
      },
      type: 'text',
    },
    {
      name: 'slug',
      label: {
        es: 'Identificador (Slug)',
        en: 'Slug',
      },
      type: 'text',
      defaultValue: 'home',
      hooks: {
        beforeValidate: [ensureUniqueSlug],
      },
      index: true,
    },
  ],
}
