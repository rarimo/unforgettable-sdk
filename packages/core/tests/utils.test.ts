import { encryptDataTransferData, generateDataTransferKeyPair } from '../src'

describe('utils', () => {
  const plainText = 'text'

  describe('RSA key pair generation', () => {
    it('returns a valid base64url public key', async () => {
      const keyPair = await generateDataTransferKeyPair(512)

      expect(keyPair.publicKey).toMatch(/^[A-Za-z0-9\-_]+$/)
    })

    it('encrypts ASCII text to a non-identical ciphertext', async () => {
      const keyPair = await generateDataTransferKeyPair(512)

      const encryptedText = keyPair.encrypt(plainText)

      expect(encryptedText).not.toEqual(plainText)
    })

    it('decrypts back to the original ASCII text', async () => {
      const keyPair = await generateDataTransferKeyPair(512)

      const encryptedText = keyPair.encrypt(plainText)
      const decryptedText = keyPair.decrypt(encryptedText)

      expect(decryptedText).toEqual(plainText)
    })

    it('throws when message is too long for a 512-bit key (PKCS#1 v1.5 limit)', async () => {
      const keyPair = await generateDataTransferKeyPair(512)
      const modulusBytes = 512 / 8
      const maxPlainTextLength = modulusBytes - 11

      const tooLongText = 'A'.repeat(maxPlainTextLength + 1)

      expect(() => keyPair.encrypt(tooLongText)).toThrow()
    })
  })

  describe('encrypt data transfer data', () => {
    it('can decrypt the encrypted data with key pair private key', async () => {
      const keyPair = await generateDataTransferKeyPair(512)

      const encryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const decryptedData = keyPair.decrypt(encryptedData)

      expect(decryptedData).not.toEqual(encryptedData)
      expect(decryptedData).toEqual(plainText)
    })

    it('supports multiple encryptions with the same public key', async () => {
      const keyPair = await generateDataTransferKeyPair(512)

      const firstEncryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const secondEncryptedData = encryptDataTransferData(keyPair.publicKey, plainText)

      // Due to random padding in PKCS#1 v1.5, ciphertexts may differ,
      // but both should decrypt to the same plaintext.
      expect(keyPair.decrypt(firstEncryptedData)).toBe(plainText)
      expect(keyPair.decrypt(secondEncryptedData)).toBe(plainText)
    })

    it('throws an error for an invalid public key', () => {
      const invalidPublicKey = 'invalid-base64=key'

      expect(() => encryptDataTransferData(invalidPublicKey, plainText)).toThrow()
    })

    it('throws an error when decrypting with another key pair', async () => {
      const firstKeyPair = await generateDataTransferKeyPair(512)
      const secondKeyPair = await generateDataTransferKeyPair(512)

      const ciphertext = encryptDataTransferData(firstKeyPair.publicKey, plainText)

      expect(() => secondKeyPair.decrypt(ciphertext)).toThrow()
    })
  })
})
