import { User } from '@/payload-types'

export const isAccessingSelf = ({ id, user }: { user?: any; id?: string | number }): boolean => {
  return user ? Boolean(user.id === id) : false
}
