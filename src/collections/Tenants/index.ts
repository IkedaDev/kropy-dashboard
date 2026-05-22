import type { CollectionConfig } from 'payload'

import { isSuperAdminAccess } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { filterByTenantRead } from './access/byTenant'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: {
      es: 'Organización',
      en: 'Organization',
    },
    plural: {
      es: 'Organizaciones',
      en: 'Organizations',
    },
  },
  access: {
    create: isSuperAdminAccess,
    delete: isSuperAdminAccess,
    update: isSuperAdminAccess,
    read: filterByTenantRead,
  },
  admin: {
    useAsTitle: 'name',
    group: {
      es: 'Configuración',
      en: 'Settings',
    },
  },
  fields: [
    {
      name: 'name',
      label: {
        es: 'Nombre de la Organización',
        en: 'Organization Name',
      },
      type: 'text',
      required: true,
    },
    {
      name: 'domain',
      label: {
        es: 'Dominio',
        en: 'Domain',
      },
      type: 'text',
      admin: {
        description: {
          es: 'Utilizado para la gestión del tenant basada en dominios',
          en: 'Used for domain-based tenant handling',
        },
      },
    },
    {
      name: 'slug',
      label: {
        es: 'Identificador (Slug)',
        en: 'Slug',
      },
      type: 'text',
      admin: {
        description: {
          es: 'Utilizado para rutas de URL, ejemplo: /slug-del-tenant/slug-de-la-pagina',
          en: 'Used for url paths, example: /tenant-slug/page-slug',
        },
      },
      index: true,
      required: true,
    },
    {
      name: 'allowPublicRead',
      label: {
        es: 'Permitir Lectura Pública',
        en: 'Allow Public Read',
      },
      type: 'checkbox',
      admin: {
        description: {
          es: 'Si se marca, no es necesario iniciar sesión para leer. Útil para crear páginas públicas.',
          en: 'If checked, logging in is not required to read. Useful for building public pages.',
        },
        position: 'sidebar',
      },
      defaultValue: false,
      index: true,
    },
  ],
}
