import type { CollectionBeforeOperationHook } from 'payload'

export const downloadExternalUrl: CollectionBeforeOperationHook = async ({ args, req, operation }) => {
  const argsAny = args as any
  const data = argsAny?.data
  // If we are creating or updating, and an externalUrl is specified
  if ((operation === 'create' || operation === 'update') && data?.externalUrl) {
    try {
      const externalUrl = data.externalUrl
      req.payload.logger.info(`Downloading external image in beforeOperation: ${externalUrl}`)
      
      const urlResponse = await fetch(externalUrl)
      if (!urlResponse.ok) {
        throw new Error(`Failed to fetch image from URL: ${urlResponse.statusText}`)
      }

      const arrayBuffer = await urlResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Deduce name and mimeType
      const parsedUrl = new URL(externalUrl)
      let name = parsedUrl.pathname.split('/').pop() || 'imported_image.jpg'
      if (!name.includes('.')) {
        name = `${name}.jpg`
      }
      
      const mimeType = urlResponse.headers.get('content-type') || 'image/jpeg'

      // Inject the downloaded file into the request context
      req.file = {
        data: buffer,
        name: name,
        mimetype: mimeType,
        size: buffer.length,
      }
      
      req.payload.logger.info(`Successfully injected downloaded file into request context: ${name}`)
    } catch (err: any) {
      throw new Error(`Error al descargar la imagen desde la URL: ${err?.message || err}`)
    }
  }

  return args
}
