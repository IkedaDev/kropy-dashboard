import { isSuperAdmin } from '@/access/isSuperAdmin'
import type { CollectionConfig } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { validateCLPAmount } from '@/utilities/validateCLP'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const MenuItems: CollectionConfig = {
  slug: 'menu-items',
  labels: {
    singular: {
      es: 'Plato / Ítem',
      en: 'Dish / Item',
    },
    plural: {
      es: 'Platos e Ítems',
      en: 'Dishes & Items',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'section', 'status', 'updatedAt'],
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
        es: 'Nombre del Plato / Ítem',
        en: 'Dish / Item Name',
      },
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: {
        es: 'Descripción',
        en: 'Description',
      },
      type: 'textarea',
      localized: true,
      admin: {
        description: {
          es: 'Ingredientes o descripción del plato para los clientes.',
          en: 'Ingredients or description of the dish for customers.',
        },
      },
    },
    {
      name: 'price',
      label: {
        es: 'Precio Base (CLP)',
        en: 'Base Price (CLP)',
      },
      type: 'number',
      required: true,
      validate: validateCLPAmount(true),
      min: 0,
      admin: {
        description: {
          es: 'Precio en pesos chilenos.',
          en: 'Price in Chilean pesos.',
        },
      },
    },
    {
      name: 'image',
      label: {
        es: 'Imagen',
        en: 'Image',
      },
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'section',
      label: {
        es: 'Sección de la Carta',
        en: 'Menu Section',
      },
      type: 'relationship',
      relationTo: 'menu-sections',
      required: true,
      filterOptions: ({ req }) => {
        if (req.user && !isSuperAdmin(req.user)) {
          const userTenants = getUserTenantIDs(req.user as any)
          if (userTenants.length > 0) {
            return {
              tenant: { in: userTenants },
            }
          }
        }
        return true
      },
    },
    {
      name: 'modifiers',
      label: {
        es: 'Grupos de Modificadores (Opcional)',
        en: 'Modifier Groups (Optional)',
      },
      type: 'relationship',
      relationTo: 'modifier-groups',
      hasMany: true,
      filterOptions: ({ req }) => {
        if (req.user && !isSuperAdmin(req.user)) {
          const userTenants = getUserTenantIDs(req.user as any)
          if (userTenants.length > 0) {
            return {
              tenant: { in: userTenants },
            }
          }
        }
        return true
      },
    },
    {
      name: 'allergens',
      label: {
        es: 'Alérgenos',
        en: 'Allergens',
      },
      type: 'select',
      hasMany: true,
      options: [
        { label: { es: 'Contiene Gluten', en: 'Contains Gluten' }, value: 'gluten' },
        { label: { es: 'Contiene Lactosa', en: 'Contains Lactose' }, value: 'lactose' },
        { label: { es: 'Contiene Frutos Secos', en: 'Contains Nuts' }, value: 'nuts' },
        { label: { es: 'Contiene Mariscos/Pescados', en: 'Contains Seafood' }, value: 'seafood' },
      ],
      admin: {
        description: {
          es: 'Selecciona los alérgenos presentes para informar a tus clientes.',
          en: 'Select present allergens to inform your customers.',
        },
      },
    },
    {
      name: 'dietary',
      label: {
        es: 'Información Dietaria / Preferencias',
        en: 'Dietary Info / Preferences',
      },
      type: 'select',
      hasMany: true,
      options: [
        { label: { es: 'Vegano', en: 'Vegan' }, value: 'vegan' },
        { label: { es: 'Vegetariano', en: 'Vegetarian' }, value: 'vegetarian' },
        { label: { es: 'Apto para Celíacos', en: 'Gluten-Free / Celiac Safe' }, value: 'celiac' },
      ],
    },
    {
      name: 'status',
      label: {
        es: 'Estado',
        en: 'Status',
      },
      type: 'select',
      defaultValue: 'available',
      required: true,
      options: [
        { label: { es: 'Disponible', en: 'Available' }, value: 'available' },
        { label: { es: 'Agotado', en: 'Out of Stock' }, value: 'out_of_stock' },
        { label: { es: 'Borrador', en: 'Draft' }, value: 'draft' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
