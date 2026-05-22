import type { CollectionBeforeValidateHook } from 'payload'
import { extractID } from '@/utilities/extractID'

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

export const autoSlug: CollectionBeforeValidateHook = async ({ data, req, operation, originalDoc }) => {
  if (!data) {
    return data
  }

  if (operation === 'create' || operation === 'update') {
    // Si no hay slug, o se cambió el título, recalculamos el slug base
    let baseSlug = ''
    if (data?.slug) {
      baseSlug = slugify(data.slug)
    } else if (data?.title) {
      baseSlug = slugify(data.title)
    } else if (originalDoc?.slug) {
      baseSlug = originalDoc.slug
    }

    if (!baseSlug) {
      return data
    }

    const incomingTenantID = data?.tenant ? extractID(data.tenant) : undefined
    const currentTenantID = originalDoc?.tenant ? extractID(originalDoc.tenant) : undefined
    const tenantIDToMatch = incomingTenantID !== undefined ? incomingTenantID : currentTenantID

    // Si estamos editando y el slug y tenant no han cambiado, no hay necesidad de re-validar
    if (
      operation === 'update' &&
      originalDoc?.slug === baseSlug &&
      currentTenantID === incomingTenantID
    ) {
      data.slug = baseSlug
      return data
    }

    let uniqueSlug = baseSlug
    let isUnique = false
    let counter = 0

    while (!isUnique) {
      const slugCandidate = counter === 0 ? uniqueSlug : `${uniqueSlug}-${counter}`

      const constraints: any[] = [
        {
          slug: {
            equals: slugCandidate,
          },
        },
      ]

      if (tenantIDToMatch) {
        constraints.push({
          tenant: {
            equals: tenantIDToMatch,
          },
        })
      } else {
        // Si no hay tenant (por ejemplo, producto global o antes de asignar tenant),
        // buscamos productos que tampoco tengan tenant
        constraints.push({
          tenant: {
            exists: false,
          },
        })
      }

      // Si estamos actualizando, excluimos el documento actual de la búsqueda
      if (operation === 'update' && originalDoc?.id) {
        constraints.push({
          id: {
            not_equals: originalDoc.id,
          },
        })
      }

      const findDuplicateProducts = await req.payload.find({
        collection: 'products',
        where: {
          and: constraints,
        },
        limit: 1,
      })

      if (findDuplicateProducts.docs.length === 0) {
        uniqueSlug = slugCandidate
        isUnique = true
      } else {
        counter++
      }
    }

    data.slug = uniqueSlug
  }
  return data
}