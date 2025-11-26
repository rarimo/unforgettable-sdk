import { encryptDataTransferData, generateDataTransferKeyPair } from '../src'

const BASE64_REGEX = /^[A-Za-z0-9\-_]+$/

describe('utils', () => {
  const plainText = 'test message for encryption'

  describe('generateDataTransferKeyPair', () => {
    it('returns a valid base64url public key (32 bytes for X25519)', async () => {
      const keyPair = await generateDataTransferKeyPair()

      expect(keyPair.publicKey).toMatch(BASE64_REGEX)
      expect(keyPair.publicKey.length).toBe(43) // 32 bytes base64url encoded
    })

    it('generates different key pairs on each call', async () => {
      const keyPair1 = await generateDataTransferKeyPair()
      const keyPair2 = await generateDataTransferKeyPair()

      expect(keyPair1.publicKey).not.toEqual(keyPair2.publicKey)
    })
  })

  describe('encryptDataTransferData', () => {
    it('encrypts and decrypts data correctly', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const encryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const decryptedData = keyPair.decrypt(encryptedData)

      expect(decryptedData).toEqual(plainText)
      expect(encryptedData).not.toEqual(plainText)
    })

    it('produces different ciphertexts for same plaintext (random nonce)', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const encrypted1 = encryptDataTransferData(keyPair.publicKey, plainText)
      const encrypted2 = encryptDataTransferData(keyPair.publicKey, plainText)

      expect(encrypted1).not.toEqual(encrypted2)
      expect(keyPair.decrypt(encrypted1)).toBe(plainText)
      expect(keyPair.decrypt(encrypted2)).toBe(plainText)
    })

    it('cannot decrypt with wrong key pair', async () => {
      const keyPair1 = await generateDataTransferKeyPair()
      const keyPair2 = await generateDataTransferKeyPair()

      const ciphertext = encryptDataTransferData(keyPair1.publicKey, plainText)

      expect(() => keyPair2.decrypt(ciphertext)).toThrow()
    })

    it('handles empty string', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const encrypted = encryptDataTransferData(keyPair.publicKey, '')
      const decrypted = keyPair.decrypt(encrypted)

      expect(decrypted).toBe('')
    })

    it('handles unicode characters', async () => {
      const keyPair = await generateDataTransferKeyPair()
      const unicodeText = 'Hello 世界 🌍'

      const encrypted = encryptDataTransferData(keyPair.publicKey, unicodeText)
      const decrypted = keyPair.decrypt(encrypted)

      expect(decrypted).toBe(unicodeText)
    })
  })
})
