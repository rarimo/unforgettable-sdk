import { describe } from 'node:test'

import {
  composeUnforgettableLocationHash,
  parseUnforgettableLocationHash,
  RecoveryFactor,
} from '../src'

describe('url location hash utils', () => {
  describe('url location hash composing', () => {
    it('creates valid hash string with all params (include optional)', () => {
      const params = {
        dataTransferId: '422729b4-136b-4ce6-8ae3-97427f78e20',
        encryptionPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
        walletAddress: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
      }

      const hash = composeUnforgettableLocationHash(params)
      expect(hash.startsWith('#')).toBe(true)

      const parsedParams = parseUnforgettableLocationHash(hash)
      expect(parsedParams).toEqual(params)
    })

    it('creates valid hash string with required params (exclude optional)', () => {
      const params = {
        dataTransferId: 'c466efbe-1a33-44b8-aa9a-c3611f829b3a',
        encryptionPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyZDzF4v7O',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
      }

      const hash = composeUnforgettableLocationHash(params)
      const urlSearchParams = new URLSearchParams(hash.slice(1))

      expect(urlSearchParams.get('id')).toBe(params.dataTransferId)
      expect(urlSearchParams.get('epk')).toBe(params.encryptionPublicKey)
      expect(urlSearchParams.get('f')).toBe(params.factors.join(','))
      expect(urlSearchParams.get('wa')).toBeNull()
    })
  })

  describe('url location hash parsing', () => {
    const dataTransferIdUrlParam = 'id=f773748b-832a-467a-a252-53d711e21ff3'
    const encryptedPkUrlParam = 'epk=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxw'
    const factorsUrlParam = 'f=1,2,3'
    const walletAddressUrlParam = 'wa=0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E'

    const baseUrlHash = [
      dataTransferIdUrlParam,
      encryptedPkUrlParam,
      factorsUrlParam,
      walletAddressUrlParam,
    ].join('&')

    describe('location hash parsing', () => {
      it('parses with #', () => {
        const urlWithHashTag = `#${baseUrlHash}`

        const parsedParams = parseUnforgettableLocationHash(urlWithHashTag)

        expect(parsedParams).toEqual({
          dataTransferId: 'f773748b-832a-467a-a252-53d711e21ff3',
          encryptionPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxw',
          factors: [1, 2, 3],
          walletAddress: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
        })
      })

      it('parses without #', () => {
        const parsedParams = parseUnforgettableLocationHash(baseUrlHash)

        expect(parsedParams).toEqual({
          dataTransferId: 'f773748b-832a-467a-a252-53d711e21ff3',
          encryptionPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxw',
          factors: [1, 2, 3],
          walletAddress: '0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E',
        })
      })
    })

    it('throws an error if the data transfer ID is missing', () => {
      expect(() =>
        parseUnforgettableLocationHash(
          [encryptedPkUrlParam, factorsUrlParam, walletAddressUrlParam].join('&'),
        ),
      ).toThrow()
    })

    it('throws an error if the encrypted public key is missing', () => {
      expect(() =>
        parseUnforgettableLocationHash(
          [dataTransferIdUrlParam, factorsUrlParam, walletAddressUrlParam].join('&'),
        ),
      ).toThrow()
    })

    describe('the factors parsing', () => {
      it('returns empty array if factors not provided', () => {
        const parsedParams = parseUnforgettableLocationHash(
          [dataTransferIdUrlParam, encryptedPkUrlParam].join('&'),
        )

        expect(parsedParams.factors).toEqual([])
      })

      it('returns empty array if factors key is provided but empty', () => {
        const parsedParams = parseUnforgettableLocationHash(
          [dataTransferIdUrlParam, encryptedPkUrlParam, 'f='].join('&'),
        )

        expect(parsedParams.factors).toEqual([])
      })

      it('ignores empty items in the enumeration', () => {
        const parsedParams = parseUnforgettableLocationHash(
          [dataTransferIdUrlParam, encryptedPkUrlParam, '&f=1,,2,3'].join('&'),
        )

        expect(parsedParams.factors).toEqual([1, 2, 3])
      })

      it('throws an error if the factor is not an integer number', () => {
        expect(() =>
          parseUnforgettableLocationHash(
            [dataTransferIdUrlParam, factorsUrlParam, '&f=1,abc,3'].join('&'),
          ),
        ).toThrow()
      })

      it('throws an error if the factor is out of the factors registry range', () => {
        expect(() =>
          parseUnforgettableLocationHash(
            [dataTransferIdUrlParam, factorsUrlParam, `&f=1,2,${Number.MAX_SAFE_INTEGER}`].join(
              '&',
            ),
          ),
        ).toThrow()
      })
    })
  })
})
