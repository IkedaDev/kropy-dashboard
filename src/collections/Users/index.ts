import type { CollectionConfig } from 'payload'

import { createAccess } from './access/create'
import { readAccess } from './access/read'
import { updateAndDeleteAccess } from './access/updateAndDelete'
import { externalUsersLogin } from './endpoints/externalUsersLogin'
import { ensureUniqueUsername } from './hooks/ensureUniqueUsername'
import { isSuperAdmin } from '@/access/isSuperAdmin'
import { setCookieBasedOnDomain } from './hooks/setCookieBasedOnDomain'
import { tenantsArrayField } from '@payloadcms/plugin-multi-tenant/fields'
import { validateUserChanges } from './hooks/validateUserChanges'
import { validateUserDelete } from './hooks/validateUserDelete'

const defaultTenantArrayField = tenantsArrayField({
  tenantsArrayFieldName: 'tenants',
  tenantsArrayTenantFieldName: 'tenant',
  tenantsCollectionSlug: 'tenants',
  arrayFieldAccess: {},
  tenantFieldAccess: {},
  rowFields: [
    {
      name: 'roles',
      label: {
        es: 'Roles en la Organización',
        en: 'Roles in Organization',
      },
      type: 'select',
      defaultValue: ['tenant-viewer'],
      hasMany: true,
      options: [
        { label: { es: 'Administrador de Organización', en: 'Organization Admin' }, value: 'tenant-admin' },
        { label: { es: 'Lector de Organización', en: 'Organization Viewer' }, value: 'tenant-viewer' },
      ],
      required: true,
      access: {
        update: ({ req }) => {
          const { user } = req
          if (!user) {
            return false
          }

          if (isSuperAdmin(user)) {
            return true
          }

          return true
        },
      },
    },
  ],
})

const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      es: 'Usuario',
      en: 'User',
    },
    plural: {
      es: 'Usuarios',
      en: 'Users',
    },
  },
  access: {
    create: createAccess,
    delete: updateAndDeleteAccess,
    read: readAccess,
    update: updateAndDeleteAccess,
  },
  admin: {
    useAsTitle: 'email',
    group: {
      es: 'Comercio Electrónico',
      en: 'E-commerce',
    },
  },
  auth: true,
  endpoints: [externalUsersLogin],
  fields: [
    {
      type: 'text',
      name: 'password',
      label: {
        es: 'Contraseña',
        en: 'Password',
      },
      hidden: true,
      access: {
        read: () => false, // Hide password field from read access
        update: ({ req, id }) => {
          const { user } = req
          if (!user) {
            return false
          }

          if (id === user.id) {
            // Allow user to update their own password
            return true
          }

          return isSuperAdmin(user)
        },
      },
    },
    {
      admin: {
        position: 'sidebar',
      },
      name: 'roles',
      label: {
        es: 'Roles Globales',
        en: 'Global Roles',
      },
      type: 'select',
      defaultValue: ['user'],
      hasMany: true,
      options: [
        { label: { es: 'Super Administrador', en: 'Super Admin' }, value: 'super-admin' },
        { label: { es: 'Usuario', en: 'User' }, value: 'user' },
      ],
      access: {
        update: ({ req }) => {
          return isSuperAdmin(req.user)
        },
      },
    },
    {
      name: 'username',
      label: {
        es: 'Nombre de Usuario',
        en: 'Username',
      },
      type: 'text',
      hooks: {
        beforeValidate: [ensureUniqueUsername],
      },
      index: true,
    },
    {
      ...defaultTenantArrayField,
      label: {
        es: 'Organizaciones Asociadas',
        en: 'Associated Organizations',
      },
      admin: {
        ...(defaultTenantArrayField?.admin || {}),
        position: 'sidebar',
      },
    },
  ],
  // The following hook sets a cookie based on the domain a user logs in from.
  // It checks the domain and matches it to a tenant in the system, then sets
  // a 'payload-tenant' cookie for that tenant.

  hooks: {
    afterLogin: [setCookieBasedOnDomain],
    beforeChange: [validateUserChanges],
    beforeDelete: [validateUserDelete],
  },
}

export default Users
