import type { Block } from 'payload'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const ProductShowcase: Block = {
  slug: 'productShowcase',
  labels: {
    singular: {
      es: 'Vitrina de Producto',
      en: 'Product Showcase',
    },
    plural: {
      es: 'Vitrinas de Producto',
      en: 'Product Showcases',
    },
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
      admin: {
        description: {
          es: 'Selecciona un producto de tu catálogo para insertarlo en el artículo.',
          en: 'Select a product from your catalog to embed it in the article.',
        },
      },
      filterOptions: ({ req }) => {
        if (req.user && !req.user.roles?.includes('super-admin')) {
          const userTenants = getUserTenantIDs(req.user)
          if (userTenants.length > 0) {
            return {
              tenant: { in: userTenants },
            }
          }
        }
        return true
      },
    },
  ],
}
