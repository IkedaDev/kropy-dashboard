import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'

export const GalleryCategories: CollectionConfig = {
  slug: 'gallery-categories',
  labels: {
    singular: {
      es: 'Categoría de Galería',
      en: 'Gallery Category',
    },
    plural: {
      es: 'Categorías de Galería',
      en: 'Gallery Categories',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: {
      es: 'Galería',
      en: 'Gallery',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [createAutoSlug('gallery-categories', 'name')],
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
      admin: {
        placeholder: {
          es: 'ej. Matrimonios, Corporativos, Naturaleza, Retratos',
          en: 'e.g. Weddings, Corporate, Nature, Portraits',
        },
      },
    },
    {
      name: 'slug',
      label: {
        es: 'Ruta (Slug)',
        en: 'Slug',
      },
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: {
          es: 'Se genera automáticamente a partir del nombre.',
          en: 'Automatically generated from the name.',
        },
      },
    },
  ],
}
