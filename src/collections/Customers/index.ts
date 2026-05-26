import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { extractID } from '@/utilities/extractID'
import { preventDeleteIfOrdered } from './hooks/preventDeleteIfOrdered'
import { handleDefaultAddress } from './hooks/handleDefaultAddress'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    tokenExpiration: 7200, // 2 horas
    verify: false, // Cambiar a true si quieres confirmar cuentas por correo
    cookies: {
      secure: true,
      sameSite: 'Lax',
    },
  },
  labels: {
    singular: {
      es: 'Cliente',
      en: 'Customer',
    },
    plural: {
      es: 'Clientes',
      en: 'Customers',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'phone', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: superAdminOrTenantAdminAccess,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeValidate: [
      handleDefaultAddress,
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
    beforeDelete: [preventDeleteIfOrdered],
  },
  fields: [
    {
      name: 'name',
      label: {
        es: 'Nombre Completo',
        en: 'Full Name',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: {
        es: 'Correo Electrónico',
        en: 'Email Address',
      },
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'phone',
      label: {
        es: 'Teléfono',
        en: 'Phone Number',
      },
      type: 'text',
    },
    {
      name: 'address',
      label: {
        es: 'Dirección de Despacho por Defecto',
        en: 'Default Shipping Address',
      },
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'addresses',
      label: {
        es: 'Direcciones de Despacho',
        en: 'Shipping Addresses',
      },
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'label',
          label: {
            es: 'Etiqueta (ej: Casa, Oficina)',
            en: 'Label (e.g. Home, Office)',
          },
          type: 'text',
        },
        {
          name: 'street',
          label: {
            es: 'Calle',
            en: 'Street',
          },
          type: 'text',
          required: true,
        },
        {
          name: 'number',
          label: {
            es: 'Número',
            en: 'Number',
          },
          type: 'text',
          required: true,
        },
        {
          name: 'apartmentOrOffice',
          label: {
            es: 'Departamento / Oficina / Block (Opcional)',
            en: 'Apartment / Office / Suite (Optional)',
          },
          type: 'text',
        },
        {
          name: 'city',
          label: {
            es: 'Comuna / Ciudad',
            en: 'Commune / City',
          },
          type: 'text',
          required: true,
        },
        {
          name: 'state',
          label: {
            es: 'Región / Estado',
            en: 'Region / State',
          },
          type: 'text',
          required: true,
        },
        {
          name: 'postalCode',
          label: {
            es: 'Código Postal (Opcional)',
            en: 'Postal Code (Optional)',
          },
          type: 'text',
        },
        {
          name: 'country',
          label: {
            es: 'País (Opcional)',
            en: 'Country (Optional)',
          },
          type: 'text',
          defaultValue: 'Chile',
        },
        {
          name: 'isDefault',
          label: {
            es: 'Dirección por Defecto',
            en: 'Default Address',
          },
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
