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

export function generateDataTransferKeyPair(): Promise<DataTransferKeyPair> {
  return Promise.resolve().then(() => {
    const privateKey = randomBytes(X25519_PUBLIC_KEY_SIZE)
    const publicKey = x25519.getPublicKey(privateKey)

    return {
      publicKey: bytesToBase64Url(publicKey),
      decrypt: (encryptedData: string) => {
        const combined = base64UrlToBytes(encryptedData)
        const ephemeralPublicKey = combined.slice(0, X25519_PUBLIC_KEY_SIZE)
        const nonce = combined.slice(
          X25519_PUBLIC_KEY_SIZE,
          X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE,
        )
        const encrypted = combined.slice(X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE)

        const sharedSecret = x25519.getSharedSecret(privateKey, ephemeralPublicKey)
        const encryptionKey = deriveEncryptionKey(sharedSecret)

        const cipher = chacha20poly1305(encryptionKey, nonce)
        const decrypted = cipher.decrypt(encrypted)

        return bytesToString(decrypted)
      },
    }
  })
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
  const encrypted = cipher.encrypt(dataBytes)

  const combined = new Uint8Array(X25519_PUBLIC_KEY_SIZE + CHACHA20_NONCE_SIZE + encrypted.length)
  combined.set(ephemeralPublicKey, 0)
  combined.set(nonce, X25519_PUBLIC_KEY_SIZE)
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
