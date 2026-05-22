import type { CollectionConfig } from 'payload'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'price', 'stock', 'updatedAt'],
    group: 'Ecommerce',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [createAutoSlug('products', 'title')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Precio base en CLP (Pesos Chilenos)',
      },
    },
    {
      name: 'compareAtPrice',
      label: 'Precio de Comparación / Antes (Opcional)',
      type: 'number',
      min: 0,
      admin: {
        description: 'Precio original del producto antes de la oferta (se mostrará tachado). Dejar vacío si no está en oferta.',
      },
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Stock global si el producto no tiene variantes habilitadas.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'images',
      type: 'array',
      label: 'Galería de Imágenes',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'categories',
      label: 'Categorías',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
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
    {
      name: 'hasVariants',
      label: '¿Este producto tiene variantes?',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Habilita variantes (tallas, colores) con stock y precio independiente.',
      },
    },
    {
      name: 'variants',
      label: 'Variantes del Producto',
      type: 'array',
      minRows: 1,
      admin: {
        condition: (data) => {
          if (data && data.hasVariants) {
            return true
          }
          return false
        },
      },
      fields: [
        {
          name: 'variantName',
          label: 'Nombre de la Variante',
          type: 'text',
          required: true,
          admin: {
            placeholder: 'ej. Talla M / Color Azul',
          },
        },
        {
          name: 'sku',
          label: 'SKU de la Variante',
          type: 'text',
        },
        {
          name: 'price',
          label: 'Precio de la Variante (Opcional)',
          type: 'number',
          min: 0,
          admin: {
            description: 'Dejar vacío para usar el precio base del producto.',
          },
        },
        {
          name: 'compareAtPrice',
          label: 'Precio de Comparación / Antes (Opcional)',
          type: 'number',
          min: 0,
          admin: {
            description: 'Precio original de la variante antes de la oferta (se mostrará tachado). Dejar vacío si no está en oferta.',
          },
        },
        {
          name: 'stock',
          label: 'Stock de la Variante',
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 0,
        },
      ],
    },
  ],
}

