import type { CollectionConfig } from 'payload'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const BlogCategories: CollectionConfig = {
  slug: 'blog-categories',
  labels: {
    singular: {
      es: 'Categoría de Blog',
      en: 'Blog Category',
    },
    plural: {
      es: 'Categorías de Blog',
      en: 'Blog Categories',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: {
      es: 'Blog',
      en: 'Blog',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [createAutoSlug('blog-categories', 'name')],
  },
  fields: [
    {
      name: 'name',
      label: {
        es: 'Nombre de la Categoría',
        en: 'Category Name',
      },
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: {
        es: 'Ruta (Slug)',
        en: 'Slug',
      },
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
