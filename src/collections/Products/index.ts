import type { CollectionConfig } from 'payload'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { preventDeleteIfOrdered } from './hooks/preventDeleteIfOrdered'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: {
      es: 'Producto',
      en: 'Product',
    },
    plural: {
      es: 'Productos',
      en: 'Products',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'price', 'stock', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [createAutoSlug('products', 'title')],
    beforeDelete: [preventDeleteIfOrdered],
  },
  fields: [
    {
      name: 'title',
      label: {
        es: 'Título / Nombre del Producto',
        en: 'Title / Product Name',
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
      name: 'price',
      label: {
        es: 'Precio Base',
        en: 'Base Price',
      },
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: {
          es: 'Precio base en CLP (Pesos Chilenos)',
          en: 'Base price in CLP (Chilean Pesos)',
        },
      },
    },
    {
      name: 'compareAtPrice',
      label: {
        es: 'Precio de Comparación / Antes (Opcional)',
        en: 'Compare-at Price / Before (Optional)',
      },
      type: 'number',
      min: 0,
      admin: {
        description: {
          es: 'Precio original del producto antes de la oferta (se mostrará tachado). Dejar vacío si no está en oferta.',
          en: 'Original price of the product before the sale (will show crossed out). Leave empty if not on sale.',
        },
      },
    },
    {
      name: 'stock',
      label: {
        es: 'Stock',
        en: 'Stock',
      },
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description: {
          es: 'Stock global si el producto no tiene variantes habilitadas.',
          en: 'Global stock if the product does not have variants enabled.',
        },
      },
    },
    {
      name: 'description',
      label: {
        es: 'Descripción',
        en: 'Description',
      },
      type: 'richText',
      localized: true,
    },
    {
      name: 'images',
      type: 'array',
      label: {
        es: 'Galería de Imágenes',
        en: 'Image Gallery',
      },
      minRows: 1,
      fields: [
        {
          name: 'image',
          label: {
            es: 'Imagen',
            en: 'Image',
          },
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'categories',
      label: {
        es: 'Categorías',
        en: 'Categories',
      },
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
      name: 'brand',
      label: {
        es: 'Marca',
        en: 'Brand',
      },
      type: 'relationship',
      relationTo: 'brands',
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
      label: {
        es: '¿Este producto tiene variantes?',
        en: 'Does this product have variants?',
      },
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: {
          es: 'Habilita variantes (tallas, colores) con stock y precio independiente.',
          en: 'Enable variants (sizes, colors) with independent stock and price.',
        },
      },
    },
    {
      name: 'variants',
      label: {
        es: 'Variantes del Producto',
        en: 'Product Variants',
      },
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
          label: {
            es: 'Nombre de la Variante',
            en: 'Variant Name',
          },
          type: 'text',
          required: true,
          admin: {
            placeholder: {
              es: 'ej. Talla M / Color Azul',
              en: 'e.g. Size M / Color Blue',
            },
          },
        },
        {
          name: 'sku',
          label: {
            es: 'SKU de la Variante',
            en: 'Variant SKU',
          },
          type: 'text',
        },
        {
          name: 'price',
          label: {
            es: 'Precio de la Variante (Opcional)',
            en: 'Variant Price (Optional)',
          },
          type: 'number',
          min: 0,
          admin: {
            description: {
              es: 'Dejar vacío para usar el precio base del producto.',
              en: 'Leave empty to use the product\'s base price.',
            },
          },
        },
        {
          name: 'compareAtPrice',
          label: {
            es: 'Precio de Comparación / Antes (Opcional)',
            en: 'Compare-at Price / Before (Optional)',
          },
          type: 'number',
          min: 0,
          admin: {
            description: {
              es: 'Precio original de la variante antes de la oferta (se mostrará tachado). Dejar vacío si no está en oferta.',
              en: 'Original price of the variant before the sale (will show crossed out). Leave empty if not on sale.',
            },
          },
        },
        {
          name: 'stock',
          label: {
            es: 'Stock de la Variante',
            en: 'Variant Stock',
          },
          type: 'number',
          required: true,
          min: 0,
          defaultValue: 0,
        },
      ],
    },
  ],
}

