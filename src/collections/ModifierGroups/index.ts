import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { validateCLPAmount } from '@/utilities/validateCLP'

export const ModifierGroups: CollectionConfig = {
  slug: 'modifier-groups',
  labels: {
    singular: {
      es: 'Grupo de Modificadores',
      en: 'Modifier Group',
    },
    plural: {
      es: 'Grupos de Modificadores',
      en: 'Modifier Groups',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'required', 'maxSelections', 'updatedAt'],
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
        es: 'Nombre del Grupo',
        en: 'Group Name',
      },
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: {
          es: 'ej. Acompañamientos, Elige tu Salsa, Extra Ingredientes',
          en: 'e.g. Sides, Choose your Sauce, Extra Ingredients',
        },
      },
    },
    {
      name: 'required',
      label: {
        es: '¿Es obligatorio?',
        en: 'Is required?',
      },
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'minSelections',
      label: {
        es: 'Mínimo de Selecciones',
        en: 'Minimum Selections',
      },
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'maxSelections',
      label: {
        es: 'Máximo de Selecciones',
        en: 'Maximum Selections',
      },
      type: 'number',
      required: true,
      min: 1,
      defaultValue: 1,
    },
    {
      name: 'options',
      label: {
        es: 'Opciones del Grupo',
        en: 'Group Options',
      },
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'name',
          label: {
            es: 'Nombre de la Opción',
            en: 'Option Name',
          },
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'additionalPrice',
          label: {
            es: 'Precio Adicional (CLP)',
            en: 'Additional Price (CLP)',
          },
          type: 'number',
          validate: validateCLPAmount(false),
          min: 0,
          defaultValue: 0,
          admin: {
            description: {
              es: 'Costo extra en pesos chilenos que se sumará al precio base del plato si se selecciona. Colocar 0 si es gratis o no tiene costo.',
              en: 'Extra cost in Chilean pesos added to the dish base price if selected. Set to 0 if free or no extra cost.',
            },
          },
        },
      ],
    },
  ],
}
