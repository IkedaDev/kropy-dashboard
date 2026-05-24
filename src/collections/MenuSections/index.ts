import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const MenuSections: CollectionConfig = {
  slug: 'menu-sections',
  labels: {
    singular: {
      es: 'Sección del Menú',
      en: 'Menu Section',
    },
    plural: {
      es: 'Secciones del Menú',
      en: 'Menu Sections',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'updatedAt'],
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
        es: 'Nombre de la Sección',
        en: 'Section Name',
      },
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: {
          es: 'ej. Entradas, Platos de Fondo, Postres, Bebidas',
          en: 'e.g. Appetizers, Main Courses, Desserts, Drinks',
        },
      },
    },
    {
      name: 'description',
      label: {
        es: 'Descripción',
        en: 'Description',
      },
      type: 'text',
      localized: true,
      admin: {
        description: {
          es: 'Breve descripción de los ítems de esta sección.',
          en: 'Short description of items in this section.',
        },
      },
    },
    {
      name: 'order',
      label: {
        es: 'Orden de Visualización',
        en: 'Display Order',
      },
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: {
          es: 'Define el orden relativo en que se mostrará esta sección (de menor a mayor).',
          en: 'Defines the relative order in which this section will be displayed (from lowest to highest).',
        },
      },
    },
  ],
}
