import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import type { CollectionConfig } from 'payload'
import { uploadToR2 } from './hooks/uploadToR2'
import { deleteFromR2 } from './hooks/deleteFromR2'
import { downloadExternalUrl } from './hooks/downloadExternalUrl'
import { resolveMediaUrl } from './hooks/resolveMediaUrl'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      es: 'Archivo Multimedia',
      en: 'Media File',
    },
    plural: {
      es: 'Archivos Multimedia',
      en: 'Media Files',
    },
  },
  upload: {
    staticDir: 'media',
    disableLocalStorage: true,
    mimeTypes: ['image/*'],
    adminThumbnail: ({ doc }) => (typeof doc.url === 'string' ? doc.url : null),
  },
  admin: {
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
    defaultColumns: ['preview', 'url'],
    useAsTitle: 'url',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeOperation: [downloadExternalUrl],
    beforeChange: [uploadToR2],
    afterDelete: [deleteFromR2],
    afterRead: [resolveMediaUrl],
  },
  fields: [
    {
      name: 'externalUrl',
      label: {
        es: 'O ingresa la URL de una imagen',
        en: 'Or enter an image URL',
      },
      type: 'text',
      admin: {
        disableListColumn: true,
        description: {
          es: 'Utiliza este campo si deseas importar una imagen mediante su dirección web en lugar de subir un archivo.',
          en: 'Use this field if you want to import an image via its web address instead of uploading a file.',
        },
      },
      validate: (val: string | null | undefined) => {
        if (!val) return true
        try {
          new URL(val)
          if (!val.startsWith('http://') && !val.startsWith('https://')) {
            return 'Debe comenzar con http:// o https://'
          }
          return true
        } catch (_) {
          return 'Debe ingresar una URL válida'
        }
      },
    },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/payload/MediaPreview#MediaPreviewField',
          Cell: '/components/payload/MediaPreview#MediaPreviewCell',
        },
      },
    },
  ],
}