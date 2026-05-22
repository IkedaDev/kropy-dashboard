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
  labels: {
    singular: {
      es: 'Orden de Compra',
      en: 'Purchase Order',
    },
    plural: {
      es: 'Órdenes de Compra',
      en: 'Purchase Orders',
    },
  },
  admin: {
    useAsTitle: 'orderCode',
    defaultColumns: ['orderCode', 'customer.email', 'total', 'status', 'updatedAt'],
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
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
      label: {
        es: 'Código de Orden',
        en: 'Order Code',
      },
      type: 'text',
      required: true,
      index: true,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'externalId',
      label: {
        es: 'ID Externo',
        en: 'External ID',
      },
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
      label: {
        es: 'Ficha del Cliente',
        en: 'Customer File',
      },
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
      label: {
        es: 'Cliente',
        en: 'Customer',
      },
      type: 'group',
      access: {
        update: onlySuperAdminCanUpdate,
      },
      fields: [
        {
          name: 'name',
          label: {
            es: 'Nombre',
            en: 'Name',
          },
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          label: {
            es: 'Correo Electrónico',
            en: 'Email Address',
          },
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          label: {
            es: 'Teléfono',
            en: 'Phone',
          },
          type: 'text',
        },
        {
          name: 'shippingAddress',
          label: {
            es: 'Dirección de Despacho',
            en: 'Shipping Address',
          },
          type: 'text',
        },
      ],
    },
    {
      name: 'items',
      label: {
        es: 'Artículos',
        en: 'Items',
      },
      type: 'array',
      required: true,
      minRows: 1,
      access: {
        update: onlySuperAdminCanUpdate,
      },
      fields: [
        {
          name: 'product',
          label: {
            es: 'Producto',
            en: 'Product',
          },
          type: 'relationship',
          relationTo: 'products',
          required: false,
        },
        {
          name: 'variantId',
          label: {
            es: 'ID de la Variante',
            en: 'Variant ID',
          },
          type: 'text',
        },
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
          name: 'price',
          label: {
            es: 'Precio',
            en: 'Price',
          },
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'quantity',
          label: {
            es: 'Cantidad',
            en: 'Quantity',
          },
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    },
    {
      name: 'subtotal',
      label: {
        es: 'Subtotal',
        en: 'Subtotal',
      },
      type: 'number',
      required: true,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'shippingCost',
      label: {
        es: 'Costo de Despacho',
        en: 'Shipping Cost',
      },
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'discountAmount',
      label: {
        es: 'Monto de Descuento',
        en: 'Discount Amount',
      },
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'total',
      label: {
        es: 'Total',
        en: 'Total',
      },
      type: 'number',
      required: true,
      min: 0,
      access: {
        update: onlySuperAdminCanUpdate,
      },
    },
    {
      name: 'status',
      label: {
        es: 'Estado',
        en: 'Status',
      },
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        {
          label: {
            es: 'Pendiente',
            en: 'Pending',
          },
          value: 'pending',
        },
        {
          label: {
            es: 'Pagado',
            en: 'Paid',
          },
          value: 'paid',
        },
        {
          label: {
            es: 'Enviado',
            en: 'Shipped',
          },
          value: 'shipped',
        },
        {
          label: {
            es: 'Cancelado',
            en: 'Cancelled',
          },
          value: 'cancelled',
        },
      ],
    },
    {
      name: 'discountCode',
      label: {
        es: 'Cupón Utilizado',
        en: 'Coupon Used',
      },
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
      label: {
        es: 'Stock Descontado',
        en: 'Stock Discounted',
      },
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
      label: {
        es: 'Cupón Contabilizado',
        en: 'Coupon Counted',
      },
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
      name: 'shippingCourier',
      label: {
        es: 'Courier / Empresa de Envíos',
        en: 'Courier / Shipping Company',
      },
      type: 'text',
    },
    {
      name: 'trackingNumber',
      label: {
        es: 'Número de Seguimiento (Tracking)',
        en: 'Tracking Number',
      },
      type: 'text',
    },
    {
      name: 'internalNotes',
      label: {
        es: 'Notas Internas',
        en: 'Internal Notes',
      },
      type: 'textarea',
      admin: {
        description: {
          es: 'Notas de uso interno para la administración del comercio.',
          en: 'Internal notes for store administration.',
        },
      },
    },
    {
      name: 'statusHistory',
      label: {
        es: 'Historial de Estados',
        en: 'Status History',
      },
      type: 'array',
      admin: {
        readOnly: true,
        description: {
          es: 'Registro de auditoría de los cambios de estado de la orden.',
          en: 'Audit log of order status changes.',
        },
      },
      fields: [
        {
          name: 'status',
          label: {
            es: 'Estado',
            en: 'Status',
          },
          type: 'select',
          required: true,
          options: [
            { label: { es: 'Pendiente', en: 'Pending' }, value: 'pending' },
            { label: { es: 'Pagado', en: 'Paid' }, value: 'paid' },
            { label: { es: 'Enviado', en: 'Shipped' }, value: 'shipped' },
            { label: { es: 'Cancelado', en: 'Cancelled' }, value: 'cancelled' },
          ],
        },
        {
          name: 'changedAt',
          label: {
            es: 'Fecha de Cambio',
            en: 'Change Date',
          },
          type: 'date',
          required: true,
        },
        {
          name: 'changedBy',
          label: {
            es: 'Cambiado Por (Usuario)',
            en: 'Changed By (User)',
          },
          type: 'relationship',
          relationTo: 'users',
        },
        {
          name: 'notes',
          label: {
            es: 'Notas / Comentarios',
            en: 'Notes / Comments',
          },
          type: 'text',
        },
      ],
    },
  ],
}

