import { chacha20poly1305 } from '@noble/ciphers/chacha.js'
import { x25519 } from '@noble/curves/ed25519.js'
import { hkdf } from '@noble/hashes/hkdf.js'
import { sha256 } from '@noble/hashes/sha2.js'

// Cryptographic constants
const X25519_PUBLIC_KEY_SIZE = 32 // bytes
const CHACHA20_NONCE_SIZE = 12 // bytes (96 bits)
const HKDF_KEY_SIZE = 32 // bytes (256 bits)

export interface DataTransferKeyPair {
  publicKey: string
  decrypt(encryptedData: string): string
}

export async function generateDataTransferKeyPair(): Promise<DataTransferKeyPair> {
  const privateKey = randomBytes(X25519_PUBLIC_KEY_SIZE)
  const publicKey = x25519.getPublicKey(privateKey)

  return {
    publicKey: bytesToBase64Url(publicKey),
    decrypt: (encryptedData: string) => {
      // Encrypted data format:
      // [32 bytes ephemeral public key][12 bytes nonce][ciphertext + 16 bytes auth tag]
      const combined = base64UrlToBytes(encryptedData)

      // Extract ephemeral public key (bytes 0-31)
      const ephemeralPublicKey = combined.slice(0, X25519_PUBLIC_KEY_SIZE)

      // Extract nonce (bytes 32-43)
      const nonce = combined.slice(
        X25519_PUBLIC_KEY_SIZE,
        X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE,
      )

      // Extract ciphertext with authentication tag (bytes 44+)
      const encrypted = combined.slice(X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE)

      // Perform X25519 key exchange: our private key + their ephemeral public key = shared secret
      const sharedSecret = x25519.getSharedSecret(privateKey, ephemeralPublicKey)

      // Derive the actual encryption key from shared secret using HKDF
      const encryptionKey = deriveEncryptionKey(sharedSecret)

      const cipher = chacha20poly1305(encryptionKey, nonce)
      const decrypted = cipher.decrypt(encrypted)

      return bytesToString(decrypted)
    },
  }
}

export function encryptDataTransferData(publicKey: string, data: string): string {
  const recipientPublicKey = base64UrlToBytes(publicKey)
  const ephemeralPrivateKey = randomBytes(X25519_PUBLIC_KEY_SIZE)
  const ephemeralPublicKey = x25519.getPublicKey(ephemeralPrivateKey)

  const sharedSecret = x25519.getSharedSecret(ephemeralPrivateKey, recipientPublicKey)
  const encryptionKey = deriveEncryptionKey(sharedSecret)
  const nonce = randomBytes(CHACHA20_NONCE_SIZE)

  const cipher = chacha20poly1305(encryptionKey, nonce)
  const dataBytes = stringToBytes(data)
  const encrypted = cipher.encrypt(dataBytes) // Includes 16-byte Poly1305 authentication tag

  // Build encrypted data format:
  // [32 bytes ephemeral public key][12 bytes nonce][ciphertext + 16 bytes auth tag]
  const combined = new Uint8Array(X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE + encrypted.length)
  // Bytes 0-31: ephemeral public key
  combined.set(ephemeralPublicKey, 0)
  // Bytes 32-43: nonce
  combined.set(nonce, X25519_PUBLIC_KEY_SIZE)
  // Bytes 44+: ciphertext + tag
  combined.set(encrypted, X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE)

  return bytesToBase64Url(combined)
}

function randomBytes(length: number): Uint8Array {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint8Array(length))
  }
  throw new Error('crypto.getRandomValues not available')
}

function deriveEncryptionKey(
  sharedSecret: Uint8Array,
  info: string = 'unforgettable-encryption',
): Uint8Array {
  const infoBytes = stringToBytes(info)
  return hkdf(sha256, sharedSecret, undefined, infoBytes, HKDF_KEY_SIZE)
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
  const b64 =
    typeof btoa !== 'undefined' ? btoa(binaryString) : Buffer.from(bytes).toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  let b64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='

  if (typeof atob !== 'undefined') {
    const binaryString = atob(b64)
    return new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i))
  }
  return new Uint8Array(Buffer.from(b64, 'base64'))
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}
