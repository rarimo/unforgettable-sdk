import { DataTransferKeyPair, encryptDataTransferData, generateDataTransferKeyPair } from '../src'

describe('utils', () => {
  describe('RSA key pair generation', () => {
    let keyPair: DataTransferKeyPair

    beforeAll(async () => {
      keyPair = await generateDataTransferKeyPair(512)
    })

    it('returns a valid function structure', () => {
      expect(typeof keyPair.publicKey).toBe('string')
      expect(typeof keyPair.encrypt).toBe('function')
      expect(typeof keyPair.decrypt).toBe('function')
    })

    it('returns a valid base64url public key', () => {
      expect(keyPair.publicKey).toMatch(/^[A-Za-z0-9\-_]+$/)
      expect(keyPair.publicKey.includes('=')).toBe(false)
    })

    it('encrypts ASCII text to a non-identical ciphertext', () => {
      const plainText = 'Text'

      const encryptedText = keyPair.encrypt(plainText)

      expect(encryptedText).not.toEqual(plainText)
    })

    it('decrypts back to the original ASCII text', () => {
      const plainText = 'Text'

      const encryptedText = keyPair.encrypt(plainText)
      const decryptedText = keyPair.decrypt(encryptedText)

      expect(decryptedText).toEqual(plainText)
    })

    it('throws when message is too long for a 512-bit key (PKCS#1 v1.5 limit)', () => {
      const modulusBytes = 512 / 8
      const maxPlainTextLength = modulusBytes - 11

      const tooLongText = 'A'.repeat(maxPlainTextLength + 1)

      expect(() => keyPair.encrypt(tooLongText)).toThrow()
    })
  })

  describe('encrypt data transfer data', () => {
    let keyPair: DataTransferKeyPair

    beforeAll(async () => {
      keyPair = await generateDataTransferKeyPair(512)
    })

    it('encrypts with the public key and is decryptable with its matching private key', () => {
      const plainText = 'Text'

      const encryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const decryptedData = keyPair.decrypt(encryptedData)

      expect(typeof encryptedData).toBe('string')
      expect(decryptedData).not.toEqual(encryptedData)
      expect(decryptedData).toEqual(plainText)
    })

    it('supports multiple encryptions with the same public key', () => {
      const plainText = 'Text'

      const firstEncryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const secondsEncryptedData = encryptDataTransferData(keyPair.publicKey, plainText)

      // Due to random padding in PKCS#1 v1.5, ciphertexts may differ,
      // but both should decrypt to the same plaintext.
      expect(keyPair.decrypt(firstEncryptedData)).toBe(plainText)
      expect(keyPair.decrypt(secondsEncryptedData)).toBe(plainText)
    })

    it('throws an error for an invalid public key', () => {
      const plainText = 'Text'
      const invalidPublicKey = 'invalid-base64=key'

      expect(() => encryptDataTransferData(invalidPublicKey, plainText)).toThrow()
    })

    it('throws an error when decrypting with another key pair', async () => {
      const plainText = 'Text'
      const secondKeyPair = await generateDataTransferKeyPair(512)

      const ciphertext = encryptDataTransferData(keyPair.publicKey, plainText)

      expect(() => secondKeyPair.decrypt(ciphertext)).toThrow()
    })
  })
})
