import { CollectionBeforeValidateHook } from 'payload'
import { extractID } from '@/utilities/extractID'

function hasBlock(node: any, blockSlug: string): boolean {
  if (!node) return false
  if (node.type === 'block' && node.fields?.blockType === blockSlug) {
    return true
  }
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (hasBlock(child, blockSlug)) return true
    }
  }
  return false
}

export const validateModules: CollectionBeforeValidateHook = async ({ data, req }) => {
  if (!data) return data

  const lexicalContent = data.content
  if (!lexicalContent) return data

  const rootNode = lexicalContent.root || lexicalContent
  const hasProductShowcase = hasBlock(rootNode, 'productShowcase')

  if (hasProductShowcase) {
    // Resolve tenant ID
    const tenantID = data.tenant ? extractID(data.tenant) : undefined
    if (tenantID) {
      const tenant = await req.payload.findByID({
        collection: 'tenants',
        id: tenantID,
        depth: 0,
      })

      if (!tenant || !tenant.enabledModules?.includes('ecommerce')) {
        throw new Error(
          'No puedes insertar productos en el artículo porque el módulo de E-Commerce no está habilitado para esta organización.'
        )
      }
    }
  }

  return data
}
