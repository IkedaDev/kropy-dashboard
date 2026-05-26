import type { CollectionConfig } from 'payload'

import { isSuperAdminAccess, isSuperAdmin } from '@/access/isSuperAdmin'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { filterByTenantRead } from './access/byTenant'
import { encrypt, decrypt } from '@/utilities/encryption'

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
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    group: {
      es: 'Configuración',
      en: 'Settings',
    },
    hidden: ({ user }) => !isSuperAdmin(user as any),
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
    {
      name: 'enabledModules',
      label: {
        es: 'Módulos Habilitados',
        en: 'Enabled Modules',
      },
      type: 'select',
      hasMany: true,
      defaultValue: ['ecommerce'],
      options: [
        { label: { es: 'Comercio Electrónico', en: 'E-commerce' }, value: 'ecommerce' },
        { label: { es: 'Blog', en: 'Blog' }, value: 'blog' },
        { label: { es: 'Cartas de Restaurante', en: 'Restaurant Menus' }, value: 'restaurant' },
        { label: { es: 'Galería', en: 'Gallery' }, value: 'gallery' },
      ],
      admin: {
        description: {
          es: 'Selecciona los módulos de negocio a los que esta organización tiene acceso contratado.',
          en: 'Select the business modules this organization has contracted access to.',
        },
      },
    },
    {
      name: 'buckets',
      label: {
        es: 'Buckets de Almacenamiento',
        en: 'Storage Buckets',
      },
      type: 'group',
      fields: [
        {
          name: 'provider',
          label: {
            es: 'Proveedor de Bucket',
            en: 'Bucket Provider',
          },
          type: 'select',
          required: true,
          options: [
            { label: 'Cloudflare R2', value: 'cloudflare_r2' },
          ],
        },
        {
          name: 'r2_bucket_name',
          label: {
            es: 'Nombre del Bucket R2',
            en: 'R2 Bucket Name',
          },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'cloudflare_r2',
            description: {
              es: 'El nombre exacto del bucket R2 asignado a este tenant.',
              en: 'The exact name of the R2 bucket assigned to this tenant.',
            },
          },
          validate: (val: string | null | undefined, { siblingData }: any) => {
            if (siblingData?.provider === 'cloudflare_r2' && !val) {
              return 'El nombre del bucket es requerido / Bucket name is required'
            }
            return true
          },
        },
        {
          name: 'r2_access_key_id',
          label: {
            es: 'Access Key ID de R2',
            en: 'R2 Access Key ID',
          },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'cloudflare_r2',
            description: {
              es: 'La llave de acceso pública generada específicamente para el bucket de este cliente.',
              en: 'The public access key generated specifically for this client\'s bucket.',
            },
          },
          access: {
            read: ({ req }) => isSuperAdmin(req.user),
          },
          validate: (val: string | null | undefined, { siblingData }: any) => {
            if (siblingData?.provider === 'cloudflare_r2' && !val) {
              return 'El ID de la llave de acceso es requerido / Access key ID is required'
            }
            return true
          },
        },
        {
          name: 'r2_secret_access_key',
          label: {
            es: 'Secret Access Key de R2',
            en: 'R2 Secret Access Key',
          },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'cloudflare_r2',
            description: {
              es: 'La llave secreta para este cliente (se guarda encriptada).',
              en: 'The secret access key for this client (stored encrypted).',
            },
            components: {
              Field: '/components/payload/EncryptedPasswordField',
            },
          },
          access: {
            read: ({ req }) => isSuperAdmin(req.user),
          },
          hooks: {
            beforeChange: [
              ({ value }) => encrypt(value),
            ],
            afterRead: [
              ({ value }) => decrypt(value),
            ],
          },
          validate: (val: string | null | undefined, { siblingData }: any) => {
            if (siblingData?.provider === 'cloudflare_r2' && !val) {
              return 'La llave secreta es requerida / Secret access key is required'
            }
            return true
          },
        },
        {
          name: 'r2_account_id',
          label: {
            es: 'Cloudflare Account ID',
            en: 'Cloudflare Account ID',
          },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'cloudflare_r2',
            description: {
              es: 'El ID de la cuenta de Cloudflare.',
              en: 'The Cloudflare account ID.',
            },
          },
          access: {
            read: ({ req }) => isSuperAdmin(req.user),
          },
          validate: (val: string | null | undefined, { siblingData }: any) => {
            if (siblingData?.provider === 'cloudflare_r2' && !val) {
              return 'El ID de la cuenta es requerido / Account ID is required'
            }
            return true
          },
        },
        {
          name: 'r2_public_url',
          label: {
            es: 'URL Pública / Dominio Personalizado',
            en: 'Public URL / Custom Domain',
          },
          type: 'text',
          admin: {
            condition: (_, siblingData) => siblingData?.provider === 'cloudflare_r2',
            description: {
              es: 'El dominio personalizado o URL pública de Cloudflare (ej: https://media.cliente.com).',
              en: 'The custom domain or public URL from Cloudflare (e.g., https://media.client.com).',
            },
          },
          validate: (val: string | null | undefined, { siblingData }: any) => {
            if (siblingData?.provider === 'cloudflare_r2') {
              if (!val) {
                return 'La URL pública es requerida / Public URL is required'
              }
              try {
                new URL(val)
                if (!val.startsWith('http://') && !val.startsWith('https://')) {
                  return 'Debe comenzar con http:// o https://'
                }
                return true
              } catch (_) {
                return 'Debe ingresar una URL válida / Must be a valid URL'
              }
            }
            return true
          },
        },
      ],
    },
  ],
}

