import type { CollectionAfterDeleteHook } from 'payload'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { decrypt } from '@/utilities/encryption'

export const deleteFromR2: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (!doc.filename || !doc.tenant) {
    return
  }

  const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant

  try {
    const tenantDoc = await req.payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    if (!tenantDoc || !tenantDoc.buckets || tenantDoc.buckets.provider !== 'cloudflare_r2') {
      return
    }

    const {
      r2_bucket_name,
      r2_access_key_id,
      r2_secret_access_key,
      r2_account_id,
    } = tenantDoc.buckets

    const decryptedSecretKey = decrypt(r2_secret_access_key)

    req.payload.logger.info(`Deleting file ${doc.filename} from Cloudflare R2...`)
    const s3 = new S3Client({
      endpoint: `https://${r2_account_id}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2_access_key_id!,
        secretAccessKey: decryptedSecretKey!,
      },
      region: 'auto',
    })

    await s3.send(new DeleteObjectCommand({
      Bucket: r2_bucket_name!,
      Key: doc.filename,
    }))

    req.payload.logger.info(`Successfully deleted file ${doc.filename} from R2 bucket ${r2_bucket_name}`)
  } catch (err: any) {
    req.payload.logger.error(`Error deleting file ${doc.filename} from R2: ${err?.message || err}`)
  }
}
