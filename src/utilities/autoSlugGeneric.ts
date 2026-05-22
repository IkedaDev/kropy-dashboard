import type { CollectionBeforeValidateHook, CollectionSlug } from 'payload'
import { extractID } from '@/utilities/extractID'

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
    .replace(/[^\w\-]+/g, '') // Remueve caracteres especiales
    .replace(/\-\-+/g, '-')   // Elimina guiones duplicados
}

export const createAutoSlug = (
  collectionSlug: CollectionSlug,
  titleField: string = 'title',
): CollectionBeforeValidateHook => {
  return async ({ data, req, operation, originalDoc }) => {
    if (!data) {
      return data
    }

    if (operation === 'create' || operation === 'update') {
      let baseSlug = ''
      if (data?.slug) {
        baseSlug = slugify(data.slug)
      } else if (data?.[titleField]) {
        baseSlug = slugify(data[titleField])
      } else if (originalDoc?.slug) {
        baseSlug = originalDoc.slug
      }

      if (!baseSlug) {
        return data
      }

      const incomingTenantID = data?.tenant ? extractID(data.tenant) : undefined
      const currentTenantID = originalDoc?.tenant ? extractID(originalDoc.tenant) : undefined
      const tenantIDToMatch = incomingTenantID !== undefined ? incomingTenantID : currentTenantID

      // Si es una actualización y ni el slug ni el tenant cambiaron, no hacemos nada más
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
          constraints.push({
            tenant: {
              exists: false,
            },
          })
        }

        if (operation === 'update' && originalDoc?.id) {
          constraints.push({
            id: {
              not_equals: originalDoc.id,
            },
          })
        }

        const findDuplicates = await req.payload.find({
          collection: collectionSlug,
          where: {
            and: constraints,
          },
          limit: 1,
        })

        if (findDuplicates.docs.length === 0) {
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
}
