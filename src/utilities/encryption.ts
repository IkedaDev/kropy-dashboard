import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
  const secret = process.env.PAYLOAD_SECRET || 'fallback_development_secret_key_for_kropy_multi_tenant'
  // Derive a 32-byte key using SHA-256 to ensure standard key length
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * Encrypts a plain text string.
 * If the string is already encrypted (starts with 'enc:'), it is returned as is.
 */
export function encrypt(text: string | null | undefined): string | null | undefined {
  if (text === null || text === undefined || text === '') {
    return text
  }

  if (text.startsWith('enc:')) {
    return text
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const key = getEncryptionKey()
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return `enc:${iv.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt sensitive data')
  }
}

/**
 * Decrypts an encrypted string that starts with 'enc:'.
 * If the string is not encrypted, it is returned as is.
 */
export function decrypt(encryptedText: string | null | undefined): string | null | undefined {
  if (!encryptedText || !encryptedText.startsWith('enc:')) {
    return encryptedText
  }

  try {
    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      return encryptedText
    }
    const iv = Buffer.from(parts[1], 'hex')
    const encryptedData = parts[2]
    const key = getEncryptionKey()
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption failed:', error)
    return encryptedText
  }
}
