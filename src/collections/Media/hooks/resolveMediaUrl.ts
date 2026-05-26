import type { CollectionAfterReadHook } from 'payload'

export const resolveMediaUrl: CollectionAfterReadHook = async ({ doc, req }) => {
  if (!doc.filename || !doc.tenant) {
    return doc
  }

  try {
    let r2PublicUrl = ''
    
    // Resolve tenant document (doc.tenant could be just an ID if depth is 0)
    let tenantDoc = doc.tenant
    if (typeof tenantDoc === 'number' || typeof tenantDoc === 'string') {
      tenantDoc = await req.payload.findByID({
        collection: 'tenants',
        id: tenantDoc,
        depth: 0,
      })
    }

    if (tenantDoc?.buckets?.provider === 'cloudflare_r2' && tenantDoc.buckets.r2_public_url) {
      r2PublicUrl = tenantDoc.buckets.r2_public_url
    }

    if (r2PublicUrl) {
      // Normalize url: join r2PublicUrl and filename
      const baseUrl = r2PublicUrl.replace(/\/$/, '')
      doc.url = `${baseUrl}/${doc.filename}`
    }
  } catch (err) {
    req.payload.logger.error(`Error resolving media R2 URL: ${err instanceof Error ? err.message : err}`)
  }

  return doc
}
