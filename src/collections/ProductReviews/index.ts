import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const ProductReviews: CollectionConfig = {
  slug: 'product-reviews',
  admin: {
    useAsTitle: 'reviewerName',
    defaultColumns: ['product', 'reviewerName', 'rating', 'approved', 'updatedAt'],
    group: 'Ecommerce',
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
      label: 'Producto',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      index: true,
    },
    {
      name: 'customer',
      label: 'Ficha del Cliente (Opcional)',
      type: 'relationship',
      relationTo: 'customers',
    },
    {
      name: 'reviewerName',
      label: 'Nombre del Autor',
      type: 'text',
      required: true,
      admin: {
        description: 'Nombre visible de la persona que escribe la reseña.',
      },
    },
    {
      name: 'rating',
      label: 'Valoración / Estrellas',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: 'Puntuación del producto de 1 a 5 estrellas.',
      },
    },
    {
      name: 'comment',
      label: 'Comentario',
      type: 'textarea',
      required: true,
    },
    {
      name: 'approved',
      label: 'Aprobado para publicación',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Habilita este campo para que la reseña aparezca de forma pública en la web.',
      },
    },
  ],
}
