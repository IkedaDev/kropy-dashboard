import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { preventDeleteIfOrdered } from './hooks/preventDeleteIfOrdered'
import { validateCLPAmount, validateDiscountValue } from '@/utilities/validateCLP'

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  labels: {
    singular: {
      es: 'Cupón de Descuento',
      en: 'Discount Coupon',
    },
    plural: {
      es: 'Cupones de Descuento',
      en: 'Discount Coupons',
    },
  },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'usageCount', 'active', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true, // Permitir consulta pública para Astro
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data

        if (data.code) {
          // Forzar mayúsculas y limpiar espacios
          data.code = data.code.toUpperCase().trim().replace(/\s+/g, '')
        }

        const incomingTenant = data.tenant ? extractID(data.tenant) : undefined
        const currentTenant = originalDoc?.tenant ? extractID(originalDoc.tenant) : undefined
        const tenantToMatch = incomingTenant !== undefined ? incomingTenant : currentTenant

        // Si se está editando y el código o tenant no cambiaron, no verificamos duplicados
        if (
          operation === 'update' &&
          originalDoc?.code === data.code &&
          currentTenant === incomingTenant
        ) {
          return data
        }

        const constraints: any[] = [
          {
            code: {
              equals: data.code,
            },
          },
        ]

        if (tenantToMatch) {
          constraints.push({
            tenant: {
              equals: tenantToMatch,
            },
          })
        } else {
          constraints.push({
            tenant: {
              exists: false,
            },
          })
        }

        if (operation === 'update' && originalDoc?.id) {
          constraints.push({
            id: {
              not_equals: originalDoc.id,
            },
          })
        }

        const duplicates = await req.payload.find({
          collection: 'discounts',
          where: {
            and: constraints,
          },
          limit: 1,
        })

        if (duplicates.docs.length > 0) {
          throw new Error(
            `El código de cupón "${data.code}" ya existe para este tenant. Por favor utiliza uno diferente.`,
          )
        }

        return data
      },
    ],
    beforeDelete: [preventDeleteIfOrdered],
  },
  fields: [
    {
      name: 'code',
      label: {
        es: 'Código de Cupón',
        en: 'Coupon Code',
      },
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'type',
      label: {
        es: 'Tipo de Descuento',
        en: 'Discount Type',
      },
      type: 'select',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: { es: 'Porcentaje (%)', en: 'Percentage (%)' }, value: 'percentage' },
        { label: { es: 'Monto Fijo ($)', en: 'Fixed Amount ($)' }, value: 'fixed' },
      ],
    },
    {
      name: 'value',
      label: {
        es: 'Valor del Descuento',
        en: 'Discount Value',
      },
      type: 'number',
      required: true,
      validate: validateDiscountValue,
      min: 0,
    },
    {
      name: 'minPurchaseAmount',
      label: {
        es: 'Monto Mínimo de Compra',
        en: 'Minimum Purchase Amount',
      },
      type: 'number',
      validate: validateCLPAmount(false),
      min: 0,
      admin: {
        description: {
          es: 'Monto mínimo total del carro de compras requerido para aplicar este cupón.',
          en: 'Minimum total shopping cart amount required to apply this coupon.',
        },
      },
    },
    {
      name: 'usageLimit',
      label: {
        es: 'Límite de Usos Totales',
        en: 'Total Usage Limit',
      },
      type: 'number',
      min: 1,
      admin: {
        description: {
          es: 'Número máximo de veces que este cupón puede ser usado en total.',
          en: 'Maximum number of times this coupon can be used in total.',
        },
      },
    },
    {
      name: 'usageCount',
      label: {
        es: 'Cantidad de Usos',
        en: 'Usage Count',
      },
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: {
          es: 'Número de veces que se ha completado una compra con este cupón.',
          en: 'Number of times a purchase has been completed using this coupon.',
        },
      },
    },
    {
      name: 'validFrom',
      label: {
        es: 'Válido Desde',
        en: 'Valid From',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'validUntil',
      label: {
        es: 'Válido Hasta',
        en: 'Valid Until',
      },
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'active',
      label: {
        es: 'Cupón Activo',
        en: 'Coupon Active',
      },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'applicableProducts',
      label: {
        es: 'Productos Aplicables',
        en: 'Applicable Products',
      },
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
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
      admin: {
        description: {
          es: 'Limita este cupón a productos específicos. Dejar vacío para aplicar a todos los productos.',
          en: 'Limit this coupon to specific products. Leave empty to apply to all products.',
        },
      },
    },
    {
      name: 'applicableCategories',
      label: {
        es: 'Categorías Aplicables',
        en: 'Applicable Categories',
      },
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
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
      admin: {
        description: {
          es: 'Limita este cupón a categorías específicas. Dejar vacío para aplicar a todas las categorías.',
          en: 'Limit this coupon to specific categories. Leave empty to apply to all categories.',
        },
      },
    },
  ],
}
