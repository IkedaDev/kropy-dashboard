import { isSuperAdmin } from '@/access/isSuperAdmin'
import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const Galleries: CollectionConfig = {
  slug: 'galleries',
  labels: {
    singular: {
      es: 'Galería',
      en: 'Gallery',
    },
    plural: {
      es: 'Galerías',
      en: 'Galleries',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'layout', 'active', 'updatedAt'],
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
    beforeValidate: [createAutoSlug('galleries', 'title')],
  },
  fields: [
    {
      name: 'title',
      label: {
        es: 'Título de la Galería',
        en: 'Gallery Title',
      },
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: {
          es: 'ej. Portafolio de Bodas, Instaciones del Hotel',
          en: 'e.g. Wedding Portfolio, Hotel Facilities',
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
          es: 'Se genera automáticamente a partir del título.',
          en: 'Automatically generated from the title.',
        },
      },
    },
    {
      name: 'description',
      label: {
        es: 'Descripción',
        en: 'Description',
      },
      type: 'textarea',
      localized: true,
      admin: {
        description: {
          es: 'Breve introducción o descripción de esta galería.',
          en: 'Short introduction or description of this gallery.',
        },
      },
    },
    {
      name: 'coverImage',
      label: {
        es: 'Imagen de Portada',
        en: 'Cover Image',
      },
      type: 'relationship',
      relationTo: 'media',
      required: true,
      admin: {
        description: {
          es: 'Imagen representativa de la galería para listados.',
          en: 'Representative image of the gallery for listings.',
        },
      },
    },
    {
      name: 'layout',
      label: {
        es: 'Diseño Recomendado (Layout)',
        en: 'Recommended Layout',
      },
      type: 'select',
      defaultValue: 'grid',
      required: true,
      options: [
        { label: { es: 'Cuadrícula (Grid)', en: 'Grid' }, value: 'grid' },
        { label: { es: 'Masonry (Estilo Pinterest)', en: 'Masonry' }, value: 'masonry' },
        { label: { es: 'Carrusel (Slider)', en: 'Carousel / Slider' }, value: 'carousel' },
        { label: { es: 'Presentación (Slideshow)', en: 'Slideshow' }, value: 'slideshow' },
      ],
      admin: {
        description: {
          es: 'Sugerencia de visualización para el maquetado en Astro.',
          en: 'Display suggestion for Astro layout.',
        },
      },
    },
    {
      name: 'images',
      label: {
        es: 'Colección de Imágenes',
        en: 'Image Collection',
      },
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'image',
          label: {
            es: 'Imagen',
            en: 'Image',
          },
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          label: {
            es: 'Leyenda / Texto Alt (Opcional)',
            en: 'Caption / Alt Text (Optional)',
          },
          type: 'text',
          localized: true,
          admin: {
            placeholder: {
              es: 'Descripción corta de la imagen para SEO o títulos.',
              en: 'Short description of the image for SEO or captions.',
            },
          },
        },
        {
          name: 'category',
          label: {
            es: 'Categoría Interna (Opcional)',
            en: 'Internal Category (Optional)',
          },
          type: 'relationship',
          relationTo: 'gallery-categories',
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
          admin: {
            description: {
              es: 'Permite filtrar esta imagen dentro del álbum en el frontend.',
              en: 'Allows filtering this image inside the album on the frontend.',
            },
          },
        },
      ],
    },
    {
      name: 'active',
      label: {
        es: 'Galería Activa',
        en: 'Active Gallery',
      },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
