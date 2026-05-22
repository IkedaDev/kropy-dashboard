import type { CollectionConfig, FieldAccess } from 'payload'
import { superAdminOrTenantAdminAccess } from '@/utilities/superAdminOrTenantAdmin'
import { syncWebhook } from './endpoints/syncWebhook'
import { handleOrderStatusAndStock } from './hooks/handleOrderStatusAndStock'

const onlySuperAdminCanUpdate: FieldAccess = ({ req }) => {
  if (req.user && req.user.roles?.includes('super-admin')) {
    return true
  }
  return false
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderCode',
    defaultColumns: ['orderCode', 'customer.email', 'total', 'status', 'updatedAt'],
    group: 'Ecommerce',
  },
  access: {
    create: superAdminOrTenantAdminAccess,
    read: superAdminOrTenantAdminAccess,
    update: superAdminOrTenantAdminAccess,
    delete: superAdminOrTenantAdminAccess,
  },
  hooks: {
    beforeChange: [handleOrderStatusAndStock],
  },
  endpoints: [
    {
      path: '/webhook',
      method: 'post',
      handler: syncWebhook,
    },
  ],
  fields: [
    {
      name: 'orderCode',
      type: 'text',
      required: true,
      index: true,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'externalId',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'customerRef',
      label: 'Ficha del Cliente',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'customer',
      type: 'group',
      access: {
        update: onlySuperAdminCanUpdate,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'shippingAddress',
          type: 'text',
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      access: {
        update: onlySuperAdminCanUpdate,
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: false,
        },
        {
          name: 'variantId',
          label: 'ID de la Variante',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'shippingCost',
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'discountAmount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        {
          label: 'Pendiente',
          value: 'pending',
        },
        {
          label: 'Pagado',
          value: 'paid',
        },
        {
          label: 'Enviado',
          value: 'shipped',
        },
        {
          label: 'Cancelado',
          value: 'cancelled',
        },
      ],
    },
    {
      name: 'discountCode',
      label: 'Cupón Utilizado',
      type: 'relationship',
      relationTo: 'discounts',
      admin: {
        position: 'sidebar',
      },
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'wasStockDiscounted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'wasCouponCounted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
  ],
}

