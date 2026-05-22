import { CollectionBeforeDeleteHook, ValidationError } from 'payload'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getUserTenantIDs } from '../../../utilities/getUserTenantIDs'
import { extractID } from '@/utilities/extractID'

export const validateUserDelete: CollectionBeforeDeleteHook = async ({ req, id }) => {
  const { user: actor } = req

  // Permitir eliminación si no hay actor (por ejemplo, procesos internos del sistema)
  if (!actor) {
    return
  }

  // Los super-admins pueden eliminar cualquier usuario
  if (isSuperAdmin(actor)) {
    return
  }

  // Permitir si se está eliminando a sí mismo (la lógica nativa o del cliente lo maneja)
  if (actor.id === id) {
    return
  }

  // Obtener el usuario que se intenta eliminar
  const userToDelete = await req.payload.findByID({
    collection: 'users',
    id,
  })

  if (!userToDelete) {
    return
  }

  const actorAdminTenants = getUserTenantIDs(actor, 'tenant-admin')

  // 1. Evitar que un tenant-admin elimine a otro tenant-admin en tenants comunes
  const targetAdminTenants = (userToDelete.tenants || [])
    .filter((t: any) => t.roles?.includes('tenant-admin'))
    .map((t: any) => extractID(t.tenant))

  const sharedAdminTenants = targetAdminTenants.filter((tenantId: any) =>
    actorAdminTenants.includes(tenantId),
  )

  if (sharedAdminTenants.length > 0) {
    throw new ValidationError({
      errors: [
        {
          message: 'No tienes permisos para eliminar a otro tenant-admin de tu misma organización.',
          path: 'id',
        },
      ],
    })
  }

  // 2. Evitar que se elimine a un usuario si pertenece a organizaciones que el actor no administra.
  // En su lugar, el tenant-admin debería remover al usuario de su propia organización (operación update).
  const targetTenants = (userToDelete.tenants || []).map((t: any) => extractID(t.tenant))
  const nonManagedTenants = targetTenants.filter((tenantId: any) => !actorAdminTenants.includes(tenantId))

  if (nonManagedTenants.length > 0) {
    throw new ValidationError({
      errors: [
        {
          message: 'No puedes eliminar este usuario porque pertenece a otras organizaciones que no administras. Edita el usuario para removerlo de tu organización en su lugar.',
          path: 'id',
        },
      ],
    })
  }
}
