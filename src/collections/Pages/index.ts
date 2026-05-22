import type { CollectionConfig } from 'payload'

import { ensureUniqueSlug } from './hooks/ensureUniqueSlug'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      es: 'Página',
      en: 'Page',
    },
    plural: {
      es: 'Páginas',
      en: 'Pages',
    },
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
  },
  admin: {
    useAsTitle: 'title',
    group: {
      es: 'Contenido',
      en: 'Content',
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            es: 'Contenido',
            en: 'Content',
          },
          fields: [
            {
              name: 'title',
              label: {
                es: 'Título',
                en: 'Title',
              },
              type: 'text',
              required: true,
            },
            {
              name: 'slug',
              label: {
                es: 'Identificador (Slug)',
                en: 'Slug',
              },
              type: 'text',
              defaultValue: 'home',
              hooks: {
                beforeValidate: [ensureUniqueSlug],
              },
              index: true,
            },
          ],
        },
        {
          label: {
            es: 'Marca y Contacto',
            en: 'Brand & Contact',
          },
          fields: [
            {
              name: 'logo',
              label: {
                es: 'Logotipo',
                en: 'Logo',
              },
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'favicon',
              label: {
                es: 'Favicon',
                en: 'Favicon',
              },
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'contactInfo',
              label: {
                es: 'Información de Contacto',
                en: 'Contact Information',
              },
              type: 'group',
              fields: [
                {
                  name: 'phone',
                  label: {
                    es: 'Teléfono',
                    en: 'Phone',
                  },
                  type: 'text',
                },
                {
                  name: 'email',
                  label: {
                    es: 'Correo Electrónico',
                    en: 'Email',
                  },
                  type: 'text',
                },
                {
                  name: 'address',
                  label: {
                    es: 'Dirección Física',
                    en: 'Physical Address',
                  },
                  type: 'text',
                },
              ],
            },
            {
              name: 'socialLinks',
              label: {
                es: 'Redes Sociales',
                en: 'Social Networks',
              },
              type: 'group',
              fields: [
                {
                  name: 'whatsapp',
                  label: {
                    es: 'Número de WhatsApp',
                    en: 'WhatsApp Number',
                  },
                  type: 'text',
                  admin: {
                    placeholder: '+56912345678',
                  },
                },
                {
                  name: 'instagram',
                  label: {
                    es: 'Instagram URL',
                    en: 'Instagram URL',
                  },
                  type: 'text',
                  admin: {
                    placeholder: 'https://instagram.com/usuario',
                  },
                },
                {
                  name: 'facebook',
                  label: {
                    es: 'Facebook URL',
                    en: 'Facebook URL',
                  },
                  type: 'text',
                  admin: {
                    placeholder: 'https://facebook.com/pagina',
                  },
                },
                {
                  name: 'twitter',
                  label: {
                    es: 'Twitter / X URL',
                    en: 'Twitter / X URL',
                  },
                  type: 'text',
                  admin: {
                    placeholder: 'https://x.com/usuario',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
