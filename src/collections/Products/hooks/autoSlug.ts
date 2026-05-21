import type { CollectionBeforeValidateHook } from 'payload'

// Función auxiliar para limpiar strings al estilo de producción de Kropy
const slugify = (val: string): string => {
  return val
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Reemplaza espacios por guiones
    .replace(/[ñ]/g, 'n')    // Cambia eñes por enes
    .replace(/[áäâà]/g, 'a') // Limpia acentos
    .replace(/[éëêè]/g, 'e')
    .replace(/[íïîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[^\w\-]+/g, '') // Remueve caracteres especiales raros
    .replace(/\-\-+/g, '-')   // Mitiga guiones duplicados
}

export const autoSlug: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation === 'create' || operation === 'update') {
    // Si el cliente escribió o actualizó el título, recalculamos el slug automático
    if (data?.title) {
      data.slug = slugify(data.title)
    }
  }
  return data
}