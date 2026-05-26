import { CollectionBeforeChangeHook, ValidationError } from 'payload'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs'
import { extractID } from '@/utilities/extractID'

export const validateUserChanges: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const { user: actor } = req

  // Permitir la inicialización de la base de datos (seeding) o peticiones sin actor
  if (!actor) {
    return data
  }

  // Los super-admins se saltan todas las validaciones
  if (isSuperAdmin(actor)) {
    return data
  }

  // 1. Evitar que se asigne el rol global 'super-admin'
  if (data?.roles?.includes('super-admin')) {
    throw new ValidationError({
      errors: [
        {
          message: 'No tienes permisos para asignar el rol global de super-admin.',
          path: 'roles',
        },
      ],
    })
  }

  const actorAdminTenants = getUserTenantIDs(actor as any, 'tenant-admin')

  if (operation === 'update' && originalDoc) {
    const isSelf = originalDoc.id === actor.id

    // 2. Si el usuario se edita a sí mismo, bloquear cambios en sus propios roles y tenants
    if (isSelf) {
      if (JSON.stringify(data.roles) !== JSON.stringify(originalDoc.roles)) {
        throw new ValidationError({
          errors: [
            {
              message: 'No puedes modificar tus propios roles globales.',
              path: 'roles',
            },
          ],
        })
      }

      if (JSON.stringify(data.tenants) !== JSON.stringify(originalDoc.tenants)) {
        throw new ValidationError({
          errors: [
            {
              message: 'No puedes modificar tus propias asignaciones de tenant ni tus roles dentro de ellos.',
              path: 'tenants',
            },
          ],
        })
      }

      return data
    }

    // 3. Si edita a otro usuario, verificar si el usuario destino es un tenant-admin en algún tenant común
    const targetAdminTenants = (originalDoc.tenants || [])
      .filter((t: any) => t.roles?.includes('tenant-admin'))
      .map((t: any) => extractID(t.tenant))

    const sharedAdminTenants = targetAdminTenants.filter((id: any) =>
      actorAdminTenants.includes(id),
    )

    if (sharedAdminTenants.length > 0) {
      throw new ValidationError({
        errors: [
          {
            message: 'No tienes permisos para modificar a otro tenant-admin de tu misma organización.',
            path: 'tenants',
          },
        ],
      })
    }

    // 4. Asegurar que solo pueda modificar los roles de tenants que el actor administra
    // a) Verificar que no haya modificado tenants que no administra
    const oldTenants = originalDoc.tenants || []
    const newTenants = data.tenants || []

    for (const oldT of oldTenants) {
      const oldTenantId = extractID(oldT.tenant)
      if (!actorAdminTenants.includes(oldTenantId)) {
        // El actor no administra este tenant. Por tanto, el registro nuevo debe ser idéntico al antiguo
        const newT = newTenants.find((t: any) => extractID(t.tenant) === oldTenantId)
        if (!newT || JSON.stringify(newT.roles) !== JSON.stringify(oldT.roles)) {
          throw new ValidationError({
            errors: [
              {
                message: `No tienes permisos para modificar la asignación o los roles del tenant "${oldTenantId}".`,
                path: 'tenants',
              },
            ],
          })
        }
      }
    }

    // b) Verificar que cualquier nuevo tenant agregado sea administrado por el actor
    for (const newT of newTenants) {
      const newTenantId = extractID(newT.tenant)
      const wasInOld = oldTenants.some((t: any) => extractID(t.tenant) === newTenantId)
      if (!wasInOld && !actorAdminTenants.includes(newTenantId)) {
        throw new ValidationError({
          errors: [
            {
              message: `No tienes permisos para asociar este usuario al tenant "${newTenantId}".`,
              path: 'tenants',
            },
          ],
        })
      }
    }
  }

  if (operation === 'create') {
    // 5. Al crear un usuario, verificar que todos los tenants asignados sean administrados por el actor
    const newTenants = data.tenants || []
    for (const newT of newTenants) {
      const newTenantId = extractID(newT.tenant)
      if (!actorAdminTenants.includes(newTenantId)) {
        throw new ValidationError({
          errors: [
            {
              message: `No tienes permisos para asociar un nuevo usuario al tenant "${newTenantId}".`,
              path: 'tenants',
            },
          ],
        })
      }
    }
  }

  return data
}
