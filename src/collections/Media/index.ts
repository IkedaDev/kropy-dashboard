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