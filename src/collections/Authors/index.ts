import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: {
      es: 'Autor',
      en: 'Author',
    },
    plural: {
      es: 'Autores',
      en: 'Authors',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
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
  fields: [
    {
      name: 'name',
      label: {
        es: 'Nombre del Autor',
        en: 'Author Name',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      label: {
        es: 'Imagen de Perfil / Avatar',
        en: 'Profile Image / Avatar',
      },
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'bio',
      label: {
        es: 'Biografía',
        en: 'Biography',
      },
      type: 'textarea',
      localized: true,
    },
    {
      name: 'socialLinks',
      label: {
        es: 'Redes Sociales',
        en: 'Social Links',
      },
      type: 'array',
      fields: [
        {
          name: 'platform',
          label: {
            es: 'Plataforma',
            en: 'Platform',
          },
          type: 'select',
          required: true,
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
          ],
        },
        {
          name: 'url',
          label: {
            es: 'Enlace (URL)',
            en: 'Link (URL)',
          },
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
