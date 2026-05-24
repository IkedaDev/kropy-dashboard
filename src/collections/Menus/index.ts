import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { createAutoSlug } from '@/utilities/autoSlugGeneric'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const Menus: CollectionConfig = {
  slug: 'menus',
  labels: {
    singular: {
      es: 'Menú / Carta',
      en: 'Menu',
    },
    plural: {
      es: 'Menús y Cartas',
      en: 'Menus',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'active', 'updatedAt'],
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
  hooks: {
    beforeValidate: [createAutoSlug('menus', 'title')],
  },
  fields: [
    {
      name: 'title',
      label: {
        es: 'Título del Menú / Carta',
        en: 'Menu Title',
      },
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: {
          es: 'ej. Carta de Verano, Menú del Día',
          en: 'e.g. Summer Menu, Daily Specials',
        },
      },
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
        description: {
          es: 'Se genera automáticamente a partir del título. Se utiliza en la URL.',
          en: 'Automatically generated from the title. Used in the URL.',
        },
      },
    },
    {
      name: 'description',
      label: {
        es: 'Descripción / Introducción',
        en: 'Description / Introduction',
      },
      type: 'richText',
      localized: true,
    },
    {
      name: 'sections',
      label: {
        es: 'Secciones Incluidas',
        en: 'Included Sections',
      },
      type: 'relationship',
      relationTo: 'menu-sections',
      hasMany: true,
      required: true,
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
          es: 'Selecciona y ordena las secciones que componen esta carta digital.',
          en: 'Select and order the sections that make up this digital menu.',
        },
      },
    },
    {
      name: 'active',
      label: {
        es: 'Carta Activa / Visible',
        en: 'Active / Visible Menu',
      },
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: {
          es: 'Define si este menú está visible al público.',
          en: 'Defines if this menu is visible to the public.',
        },
      },
    },
  ],
}
