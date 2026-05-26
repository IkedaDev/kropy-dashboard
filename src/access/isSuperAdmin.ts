import type { Access } from 'payload'
import { User } from '../payload-types'

export const isSuperAdminAccess: Access = ({ req }): boolean => {
  return isSuperAdmin(req.user)
}

export const isSuperAdmin = (user: any): boolean => {
  return Boolean(user?.collection === 'users' && user?.roles?.includes('super-admin'))
}
