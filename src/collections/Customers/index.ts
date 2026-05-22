import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { extractID } from '@/utilities/extractID'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'phone', 'updatedAt'],
    group: 'Ecommerce',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: superAdminOrTenantAdminAccess,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [
      async ({ data, req, operation, originalDoc }) => {
        if (!data) return data

        if (data.email) {
          data.email = data.email.toLowerCase().trim()
        }

        const incomingTenant = data.tenant ? extractID(data.tenant) : undefined
        const currentTenant = originalDoc?.tenant ? extractID(originalDoc.tenant) : undefined
        const tenantToMatch = incomingTenant !== undefined ? incomingTenant : currentTenant

        if (
          operation === 'update' &&
          originalDoc?.email === data.email &&
          currentTenant === incomingTenant
        ) {
          return data
        }

        const constraints: any[] = [
          {
            email: {
              equals: data.email,
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
          collection: 'customers',
          where: {
            and: constraints,
          },
          limit: 1,
        })

        if (duplicates.docs.length > 0) {
          throw new Error(
            `El correo electrónico "${data.email}" ya está registrado en este tenant.`,
          )
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'text',
    },
    {
      name: 'address',
      label: 'Dirección de Despacho por Defecto',
      type: 'text',
    },
  ],
}
