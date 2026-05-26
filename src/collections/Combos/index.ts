import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { validateCLPAmount } from '@/utilities/validateCLP'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { isSuperAdmin } from '@/access/isSuperAdmin'

export const Combos: CollectionConfig = {
  slug: 'combos',
  labels: {
    singular: {
      es: 'Combo / Fórmula',
      en: 'Combo / Formula',
    },
    plural: {
      es: 'Combos y Fórmulas',
      en: 'Combos & Formulas',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'status', 'updatedAt'],
    group: {
      es: 'Carta Digital',
      en: 'Digital Menu',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'name',
      label: {
        es: 'Nombre del Combo',
        en: 'Combo Name',
      },
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: {
          es: 'ej. Menú Almuerzo del Día, Combo Familiar 2x1',
          en: 'e.g. Lunch Special, Family Combo 2x1',
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
          es: 'Describe qué incluye este combo cerrado.',
          en: 'Describe what this closed combo includes.',
        },
      },
    },
    {
      name: 'price',
      label: {
        es: 'Precio del Combo (CLP)',
        en: 'Combo Price (CLP)',
      },
      type: 'number',
      required: true,
      validate: validateCLPAmount(true),
      min: 0,
      admin: {
        description: {
          es: 'Precio final del combo completo en pesos chilenos.',
          en: 'Final price for the complete combo in Chilean pesos.',
        },
      },
    },
    {
      name: 'image',
      label: {
        es: 'Imagen del Combo',
        en: 'Combo Image',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'steps',
      label: {
        es: 'Pasos de Selección',
        en: 'Selection Steps',
      },
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'stepName',
          label: {
            es: 'Nombre del Paso',
            en: 'Step Name',
          },
          type: 'text',
          required: true,
          localized: true,
          admin: {
            placeholder: {
              es: 'ej. Paso 1: Elige tu Entrada, Elige tu Acompañamiento',
              en: 'e.g. Step 1: Choose your Appetizer, Choose your Side',
            },
          },
        },
        {
          name: 'isRequired',
          label: {
            es: '¿Es obligatorio?',
            en: 'Is required?',
          },
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'choices',
          label: {
            es: 'Opciones Elegibles',
            en: 'Eligible Choices',
          },
          type: 'relationship',
          relationTo: 'menu-items',
          hasMany: true,
          required: true,
          filterOptions: ({ req }) => {
            const user = req.user as any
            if (user && !isSuperAdmin(user)) {
              const userTenants = getUserTenantIDs(user)
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
              es: 'Selecciona qué platos de la carta pueden elegirse en este paso.',
              en: 'Select which menu items can be chosen in this step.',
            },
          },
        },
      ],
    },
    {
      name: 'status',
      label: {
        es: 'Estado',
        en: 'Status',
      },
      type: 'select',
      defaultValue: 'available',
      required: true,
      options: [
        { label: { es: 'Disponible', en: 'Available' }, value: 'available' },
        { label: { es: 'Agotado', en: 'Out of Stock' }, value: 'out_of_stock' },
        { label: { es: 'Borrador', en: 'Draft' }, value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
