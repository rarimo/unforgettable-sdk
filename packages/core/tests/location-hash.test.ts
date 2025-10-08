import {
  composeUnforgettableLocationHash,
  parseUnforgettableLocationHash,
  RecoveryFactor,
} from '../src'

describe('url location hash utils', () => {
  describe('composeUnforgettableLocationHash', () => {
    it('creates valid hash string with all params', () => {
      const params = {
        dataTransferId: 'data-transfer-id',
        encryptionPublicKey: 'encryption-public-key',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
        walletAddress: '0xabc',
      }

      const hash = composeUnforgettableLocationHash(params)

      expect(hash).toBe('#id=data-transfer-id&epk=encryption-public-key&f=1%2C2%2C3&wa=0xabc')
    })

    it('it creates a hash which can be parsed into the initial params object', () => {
      const params = {
        dataTransferId: 'data-transfer-id',
        encryptionPublicKey: 'encryption-public-key',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
        walletAddress: '0xabc',
      }

      const hash = composeUnforgettableLocationHash(params)
      const parsedParams = parseUnforgettableLocationHash(hash)

      expect(parsedParams).toEqual(params)
    })

    it('excludes wallet address from hash if not passed', () => {
      const params = {
        dataTransferId: 'data-transfer-id',
        encryptionPublicKey: 'encryption-public-key',
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

  describe('parseUnforgettableLocationHash', () => {
    const dataTransferIdUrlParam = 'id=data-transfer-id'
    const encryptedPkUrlParam = 'epk=encrypted-public-key'
    const factorsUrlParam = 'f=1,2,3'
    const walletAddressUrlParam = 'wa=0xabc'

    describe('location hash parsing', () => {
      it('parses location hash into a valid params object', () => {
        const parsedParams = parseUnforgettableLocationHash(
          '#id=data-transfer-id&epk=encrypted-public-key&f=1,2,3&wa=0xabc',
        )

        expect(parsedParams).toEqual({
          dataTransferId: 'data-transfer-id',
          encryptionPublicKey: 'encrypted-public-key',
          factors: [1, 2, 3],
          walletAddress: '0xabc',
        })
      })

      it('parses without #', () => {
        const parsedParams = parseUnforgettableLocationHash(
          'id=data-transfer-id&epk=encrypted-public-key&f=1,2,3&wa=0xabc',
        )

        expect(parsedParams).toEqual({
          dataTransferId: 'data-transfer-id',
          encryptionPublicKey: 'encrypted-public-key',
          factors: [1, 2, 3],
          walletAddress: '0xabc',
        })
      })
    })

    it('throws an error if the data transfer ID is missing', () => {
      expect(() =>
        parseUnforgettableLocationHash(
          [encryptedPkUrlParam, factorsUrlParam, walletAddressUrlParam].join('&'),
        ),
      ).toThrow('Invalid recovery path parameters')
    })

    it('throws an error if the encrypted public key is missing', () => {
      expect(() =>
        parseUnforgettableLocationHash(
          [dataTransferIdUrlParam, factorsUrlParam, walletAddressUrlParam].join('&'),
        ),
      ).toThrow('Invalid recovery path parameters')
    })

    describe('parseFactors', () => {
      it('returns empty array if factors are not provided', () => {
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

      it('returns the original order in case of repeated factors', () => {
        const parsedParams = parseUnforgettableLocationHash(
          [dataTransferIdUrlParam, encryptedPkUrlParam, 'f=1,2,3,2,1,3'].join('&'),
        )

        expect(parsedParams.factors).toEqual([1, 2, 3, 2, 1, 3])
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
        ).toThrow('Invalid recovery path parameters')
      })

      it('throws an error if the factor is out of the factors registry range', () => {
        expect(() =>
          parseUnforgettableLocationHash(
            [dataTransferIdUrlParam, factorsUrlParam, `&f=1,2,${Number.MAX_SAFE_INTEGER}`].join(
              '&',
            ),
          ),
        ).toThrow('Invalid recovery path parameters')
      })
    })
  })
})
