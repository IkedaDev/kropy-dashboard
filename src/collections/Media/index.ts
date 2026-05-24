import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import type { CollectionConfig } from 'payload'

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
  admin:{
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
    useAsTitle: 'url',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: () => true, 
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: {
        es: 'Enlace / URL de la Imagen',
        en: 'Image Link / URL',
      },
      required: true,
      validate: (val: string | null | undefined) => {
        if (!val) return 'Este campo es obligatorio';
        try {
          new URL(val);
          return true;
        } catch (_) {
          return 'Debe ingresar una URL válida (ej: https://ejemplo.com/imagen.png)';
        }
      },
    },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/payload/MediaPreview',
        },
      },
    },
  ], 
}