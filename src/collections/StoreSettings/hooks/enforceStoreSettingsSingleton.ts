import type { CollectionBeforeValidateHook } from 'payload'
import { extractID } from '@/utilities/extractID'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const enforceStoreSettingsSingleton: CollectionBeforeValidateHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data) return data

  let tenantID = data.tenant ? extractID(data.tenant) : undefined

  // Si no viene en data, pero el usuario está autenticado, intentamos resolverlo desde su sesión
  if (!tenantID && req.user) {
    const userTenants = getUserTenantIDs(req.user as any)
    if (userTenants.length > 0) {
      tenantID = userTenants[0]
      data.tenant = tenantID
    }
  }

  if (!tenantID) {
    return data
  }

  const constraints: any[] = [
    {
      tenant: {
        equals: tenantID,
      },
    },
  ]

  // Si es actualización, excluimos el registro que estamos modificando
  if (operation === 'update' && originalDoc?.id) {
    constraints.push({
      id: {
        not_equals: originalDoc.id,
      },
    })
  }

  const existingSettings = await req.payload.find({
    collection: 'store-settings',
    where: {
      and: constraints,
    },
    limit: 1,
  })

  if (existingSettings.docs.length > 0) {
    throw new Error(
      'Ya existe una configuración de tienda para este tenant. Edita el registro existente en su lugar.',
    )
  }

  return data
}
