import { isSuperAdmin } from '@/access/isSuperAdmin'
import type { CollectionConfig } from 'payload'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical'
import { ProductShowcase } from './blocks/ProductShowcase'
import { validateModules } from './hooks/validateModules'
import { handleReadingTime } from './hooks/handleReadingTime'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: {
      es: 'Artículo',
      en: 'Article',
    },
    plural: {
      es: 'Artículos',
      en: 'Articles',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'author', 'publishedAt', 'updatedAt'],
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
    beforeValidate: [createAutoSlug('posts', 'title'), validateModules],
    beforeChange: [handleReadingTime],
  },
  fields: [
    {
      name: 'title',
      label: {
        es: 'Título del Artículo',
        en: 'Article Title',
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
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      label: {
        es: 'Resumen / Extracto',
        en: 'Excerpt / Summary',
      },
      type: 'textarea',
      localized: true,
      admin: {
        description: {
          es: 'Breve resumen del post para listados y SEO básico.',
          en: 'Short summary of the post for listings and basic SEO.',
        },
      },
    },
    {
      name: 'content',
      label: {
        es: 'Contenido del Artículo',
        en: 'Article Content',
      },
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({
            blocks: [ProductShowcase],
          }),
        ],
      }),
    },
    {
      name: 'coverImage',
      label: {
        es: 'Imagen de Portada',
        en: 'Cover Image',
      },
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'author',
      label: {
        es: 'Autor',
        en: 'Author',
      },
      type: 'relationship',
      relationTo: 'authors',
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ req }) => {
        if (req.user && !isSuperAdmin(req.user)) {
          const userTenants = getUserTenantIDs(req.user as any)
          if (userTenants.length > 0) {
            return {
              tenant: { in: userTenants },
            }
          }
        }
        return true
      },
    },
    {
      name: 'categories',
      label: {
        es: 'Categorías',
        en: 'Categories',
      },
      type: 'relationship',
      relationTo: 'blog-categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ req }) => {
        if (req.user && !isSuperAdmin(req.user)) {
          const userTenants = getUserTenantIDs(req.user as any)
          if (userTenants.length > 0) {
            return {
              tenant: { in: userTenants },
            }
          }
        }
        return true
      },
    },
    {
      name: 'publishedAt',
      label: {
        es: 'Fecha de Publicación',
        en: 'Publish Date',
      },
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        description: {
          es: 'Si defines una fecha futura, el post permanecerá oculto en el frontend.',
          en: 'If you set a future date, the post will remain hidden in the frontend.',
        },
      },
    },
    {
      name: 'readingTime',
      label: {
        es: 'Tiempo de Lectura (Minutos)',
        en: 'Reading Time (Minutes)',
      },
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      label: {
        es: 'Optimización SEO',
        en: 'SEO Optimization',
      },
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'metaTitle',
          label: {
            es: 'Título SEO (Meta Title)',
            en: 'Meta Title',
          },
          type: 'text',
        },
        {
          name: 'metaDescription',
          label: {
            es: 'Descripción SEO (Meta Description)',
            en: 'Meta Description',
          },
          type: 'textarea',
        },
        {
          name: 'metaImage',
          label: {
            es: 'Imagen Compartido Social',
            en: 'Social Share Image',
          },
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
