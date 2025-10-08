import { encryptDataTransferData, generateDataTransferKeyPair } from '../src'

const BASE64_REGEX = /^[A-Za-z0-9\-_]+$/

describe('utils', () => {
  const plainText = 'text'

  describe('generateDataTransferKeyPair', () => {
    it('returns a valid base64url public key with default 2048 length', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const cipherText = keyPair.encrypt('A')
      const byteLenght = Buffer.from(cipherText, 'binary').length

      expect(keyPair.publicKey).toMatch(BASE64_REGEX)
      expect(byteLenght * 8).toBe(2048)
    })

    it('returns a valid base64url public key with custom 512 length', async () => {
      const bits = 512
      const keyPair = await generateDataTransferKeyPair(bits)

      const cipherText = keyPair.encrypt('A')
      const byteLenght = Buffer.from(cipherText, 'binary').length

      expect(keyPair.publicKey).toMatch(BASE64_REGEX)
      expect(byteLenght * 8).toBe(bits)
    })

    it('encrypts ASCII text to a non-identical ciphertext', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const encryptedText = keyPair.encrypt(plainText)

      expect(encryptedText).not.toEqual(plainText)
    })

    it('decrypts back to the original ASCII text', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const encryptedText = keyPair.encrypt(plainText)
      const decryptedText = keyPair.decrypt(encryptedText)

      expect(decryptedText).toEqual(plainText)
    })

    it('throws when message exceeds the size limit', async () => {
      const keyPair = await generateDataTransferKeyPair(512)
      const tooLongText = 'A'.repeat(512)

      expect(() => keyPair.encrypt(tooLongText)).toThrow(
        'Message is too long for PKCS#1 v1.5 padding.',
      )
    })
  })

  describe('encryptDataTransferData', () => {
    it('can decrypt the encrypted data with key pair private key', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const encryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const decryptedData = keyPair.decrypt(encryptedData)

      expect(decryptedData).not.toEqual(encryptedData)
      expect(decryptedData).toEqual(plainText)
    })

    it('supports multiple encryptions with the same public key', async () => {
      const keyPair = await generateDataTransferKeyPair()

      const firstEncryptedData = encryptDataTransferData(keyPair.publicKey, plainText)
      const secondEncryptedData = encryptDataTransferData(keyPair.publicKey, plainText)

      expect(keyPair.decrypt(firstEncryptedData)).toBe(plainText)
      expect(keyPair.decrypt(secondEncryptedData)).toBe(plainText)
    })

    it('throws an error for an invalid public key', () => {
      const invalidPublicKey = 'invalid-base64=key'

      expect(() => encryptDataTransferData(invalidPublicKey, plainText)).toThrow(
        'Too few bytes to read ASN.1 value.',
      )
    })

    it('throws an error when decrypting with another key pair', async () => {
      const firstKeyPair = await generateDataTransferKeyPair()
      const secondKeyPair = await generateDataTransferKeyPair()

      const ciphertext = encryptDataTransferData(firstKeyPair.publicKey, plainText)

      expect(() => secondKeyPair.decrypt(ciphertext)).toThrow('Encryption block is invalid.')
    })
  })
})
