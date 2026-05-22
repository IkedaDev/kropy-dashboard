import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const ProductReviews: CollectionConfig = {
  slug: 'product-reviews',
  labels: {
    singular: {
      es: 'Reseña de Producto',
      en: 'Product Review',
    },
    plural: {
      es: 'Reseñas de Productos',
      en: 'Product Reviews',
    },
  },
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['product', 'reviewerName', 'rating', 'approved', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
  },
  access: {
    create: () => true, // Permite que clientes de Astro dejen opiniones
    read: ({ req }) => {
      // Los administradores de tenant y super-admins pueden ver todas las reseñas.
      // Los usuarios públicos solo pueden ver las reseñas aprobadas.
      if (req.user) {
        return true
      }
      return {
        approved: {
          equals: true,
        },
      }
    },
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'product',
      label: {
        es: 'Producto',
        en: 'Product',
      },
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'customer',
      label: {
        es: 'Ficha del Cliente (Opcional)',
        en: 'Customer File (Optional)',
      },
      type: 'relationship',
      relationTo: 'customers',
    },
    {
      name: 'reviewerName',
      label: {
        es: 'Nombre del Autor',
        en: 'Author Name',
      },
      type: 'text',
      required: true,
      admin: {
        description: {
          es: 'Nombre visible de la persona que escribe la reseña.',
          en: 'Visible name of the person writing the review.',
        },
      },
    },
    {
      name: 'rating',
      label: {
        es: 'Valoración / Estrellas',
        en: 'Rating / Stars',
      },
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: {
          es: 'Puntuación del producto de 1 a 5 estrellas.',
          en: 'Product rating from 1 to 5 stars.',
        },
      },
    },
    {
      name: 'comment',
      label: {
        es: 'Comentario',
        en: 'Comment',
      },
      type: 'textarea',
      required: true,
    },
    {
      name: 'approved',
      label: {
        es: 'Aprobado para publicación',
        en: 'Approved for Publication',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: {
          es: 'Habilita este campo para que la reseña aparezca de forma pública en la web.',
          en: 'Enable this field for the review to appear publicly on the web.',
        },
      },
    },
  ],
}
