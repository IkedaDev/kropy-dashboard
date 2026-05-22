import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { extractID } from '@/utilities/extractID'

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'type', 'value', 'usageCount', 'active', 'updatedAt'],
    group: 'Ecommerce',
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
  },
  fields: [
    {
      name: 'code',
      label: 'Código de Cupón',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'type',
      label: 'Tipo de Descuento',
      type: 'select',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: 'Porcentaje (%)', value: 'percentage' },
        { label: 'Monto Fijo ($)', value: 'fixed' },
      ],
    },
    {
      name: 'value',
      label: 'Valor del Descuento',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'minPurchaseAmount',
      label: 'Monto Mínimo de Compra',
      type: 'number',
      min: 0,
      admin: {
        description: 'Monto mínimo total del carro de compras requerido para aplicar este cupón.',
      },
    },
    {
      name: 'usageLimit',
      label: 'Límite de Usos Totales',
      type: 'number',
      min: 1,
      admin: {
        description: 'Número máximo de veces que este cupón puede ser usado en total.',
      },
    },
    {
      name: 'usageCount',
      label: 'Cantidad de Usos',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Número de veces que se ha completado una compra con este cupón.',
      },
    },
    {
      name: 'validFrom',
      label: 'Válido Desde',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'validUntil',
      label: 'Válido Hasta',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'active',
      label: 'Cupón Activo',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
