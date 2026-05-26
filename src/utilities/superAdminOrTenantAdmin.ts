import { isSuperAdmin } from '@/access/isSuperAdmin'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'
import { Access } from 'payload'

export const superAdminOrTenantAdminAccess: Access = ({ req }) => {
  // Si eres super admin, pasa siempre
  if (isSuperAdmin(req.user)) return true

  // Si no eres super admin, simplemente devuelve un filtro
  // El plugin de multi-tenant se encargará de inyectar el tenant_id 
  // en la query basándose en el usuario logueado.
  const adminTenantIDs = getUserTenantIDs(req.user as any, 'tenant-admin')
  
  return {
    tenant: {
      in: adminTenantIDs,
    },
  }
}