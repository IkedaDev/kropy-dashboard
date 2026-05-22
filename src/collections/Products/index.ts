import type { CollectionConfig } from 'payload'
import { autoSlug } from './hooks/autoSlug'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title','slug', 'price', 'stock', 'updatedAt'],
    group: 'Ecommerce',
  },
  access: {
    // Reutilizamos la lógica del template: Super admins ven todo, 
    // Tenant admins ven y editan solo lo asignado a su organización.
    create: superAdminOrTenantAdminAccess, // No funcionan como se espera los hooks de pages
    read:  () => true,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    // 👇 Enganchamos la automatización antes de que Payload valide los datos
    beforeValidate: [autoSlug],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true, // 🌐 Activa el Multi-idioma nativo para el nombre del producto
    },
    {
      name: 'slug',
      type: 'text', // Genera automáticamente una URL amigable basada en el título
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
      admin: {
        description: 'Precio en CLP (Pesos Chilenos)',
      },
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'description',
      type: 'richText', // Inyecta el editor Lexical avanzado para descripciones dinámicas
      localized: true,   // Traducible campo por campo
    },
    {
      name: 'images',
      type: 'array', // 📸 Soporte para Galería de múltiples imágenes por producto
      label: 'Galería de Imágenes',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media', // ✅ Ahora funcionará porque registraremos esta colección abajo
          required: true,
        },
      ],
    },
  ],
}