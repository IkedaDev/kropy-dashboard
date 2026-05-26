import type { CollectionBeforeChangeHook } from 'payload'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import crypto from 'crypto'
import { decrypt } from '@/utilities/encryption'
import { getUserTenantIDs } from '@/utilities/getUserTenantIDs'

export const uploadToR2: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  // Determine which tenant this media belongs to
  let tenantId = data.tenant

  if (!tenantId && req.user) {
    const userTenantIds = getUserTenantIDs(req.user as any)
    if (userTenantIds.length > 0) {
      tenantId = userTenantIds[0]
      data.tenant = tenantId
    }
  }

  // If no tenant is selected, throw validation error
  if (!tenantId) {
    throw new Error('Debe especificar una Organización (tenant) para subir archivos multimedia / An Organization (tenant) must be specified to upload media.')
  }

  // Fetch the Tenant configuration
  const tenantDoc = await req.payload.findByID({
    collection: 'tenants',
    id: tenantId,
  })

  if (!tenantDoc || !tenantDoc.buckets || tenantDoc.buckets.provider !== 'cloudflare_r2') {
    throw new Error('La Organización seleccionada no tiene configurado un Bucket de Cloudflare R2 / The selected Organization does not have a Cloudflare R2 Bucket configured.')
  }

  const {
    r2_bucket_name,
    r2_access_key_id,
    r2_secret_access_key,
    r2_account_id,
    r2_public_url,
  } = tenantDoc.buckets

  // Decrypt R2 secret access key
  const decryptedSecretKey = decrypt(r2_secret_access_key)

  let fileBuffer: Buffer | null = null
  let originalName = ''
  let mimeType = ''

  // 1. Get file from upload (which is guaranteed to exist if it was uploaded or downloaded by beforeOperation)
  if (req.file) {
    fileBuffer = req.file.data
    originalName = req.file.name
    mimeType = req.file.mimetype
  }

  // If no file buffer was obtained
  if (!fileBuffer) {
    if (operation === 'create') {
      throw new Error('Debe seleccionar un archivo para subir o ingresar una URL de imagen / Must select a file to upload or enter an image URL.')
    }
    return data
  }

  // 2. Determine unique filename
  let ext = originalName.split('.').pop()?.toLowerCase() || ''
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
    ext = mimeType.split('/')[1] || 'jpg'
    if (ext === 'svg+xml') ext = 'svg'
  }
  const filename = `${crypto.randomUUID()}.${ext}`

  // 3. Compress image if it is an image type and not an SVG
  let processedBuffer = fileBuffer
  let width: number | undefined = undefined
  let height: number | undefined = undefined
  let size = fileBuffer.length

  if (mimeType.startsWith('image/') && !mimeType.includes('svg')) {
    try {
      req.payload.logger.info(`Compressing image: ${originalName}`)
      let sharpInstance = sharp(fileBuffer)

      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        sharpInstance = sharpInstance.jpeg({ quality: 80, progressive: true })
      } else if (mimeType.includes('png')) {
        sharpInstance = sharpInstance.png({ quality: 80, compressionLevel: 8 })
      } else if (mimeType.includes('webp')) {
        sharpInstance = sharpInstance.webp({ quality: 80 })
      }

      processedBuffer = await sharpInstance.toBuffer()
      size = processedBuffer.length

      const metadata = await sharp(processedBuffer).metadata()
      width = metadata.width
      height = metadata.height
    } catch (compressErr) {
      req.payload.logger.warn(`Image compression failed for ${originalName}, using original buffer. Error: ${compressErr}`)
    }
  }

  // 4. Upload to Cloudflare R2
  req.payload.logger.info(`Uploading file ${filename} to Cloudflare R2...`)
  const s3 = new S3Client({
    endpoint: `https://${r2_account_id}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2_access_key_id!,
      secretAccessKey: decryptedSecretKey!,
    },
    region: 'auto',
  })

  await s3.send(new PutObjectCommand({
    Bucket: r2_bucket_name!,
    Key: filename,
    Body: processedBuffer,
    ContentType: mimeType,
  }))

  const publicR2Url = `${r2_public_url!.replace(/\/$/, '')}/${filename}`
  req.payload.logger.info(`Successfully uploaded to: ${publicR2Url}`)

  // 5. Populate upload fields
  data.url = publicR2Url
  data.filename = filename
  data.filesize = size
  data.mimeType = mimeType
  if (width) data.width = width
  if (height) data.height = height

  // Clear the temporary URL input field
  data.externalUrl = null

  return data
}
