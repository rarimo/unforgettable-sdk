import {
  composeUnforgettableLocationHash,
  parseUnforgettableLocationHash,
  RecoveryFactor,
} from '../src'

describe('url location hash utils', () => {
  describe('composeUnforgettableLocationHash', () => {
    it('creates valid hash string with all params', () => {
      const params = {
        dataTransferId: 'test-id',
        encryptionPublicKey: 'test-pk',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
        walletAddress: '0xabc',
        group: 'm',
        customParams: {
          t: 'test-theme',
          d: 'test-data',
        },
      }

      const hash = composeUnforgettableLocationHash(params)

      expect(hash).toBe('#id=test-id&epk=test-pk&f=1%2C2%2C3&wa=0xabc&g=m&t=test-theme&d=test-data')
    })

    it('it creates a hash which can be parsed into the initial params object', () => {
      const params = {
        dataTransferId: 'test-id',
        encryptionPublicKey: 'test-pk',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
        walletAddress: '0xabc',
        group: 'm',
        customParams: {
          t: 'test-theme',
          d: 'test-data',
        },
      }

      const hash = composeUnforgettableLocationHash(params)
      const parsedParams = parseUnforgettableLocationHash(hash)

      expect(parsedParams).toEqual(params)
    })

    it('excludes wallet address from hash if not passed', () => {
      const params = {
        dataTransferId: 'test-id',
        encryptionPublicKey: 'test-pk',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
      }

      const hash = composeUnforgettableLocationHash(params)
      const urlSearchParams = new URLSearchParams(hash.slice(1))

      expect(urlSearchParams.get('id')).toBe(params.dataTransferId)
      expect(urlSearchParams.get('epk')).toBe(params.encryptionPublicKey)
      expect(urlSearchParams.get('f')).toBe(params.factors.join(','))
      expect(urlSearchParams.get('wa')).toBeNull()
      expect(hash).toBe('#id=test-id&epk=test-pk&f=1%2C2%2C3')
    })

    it('excludes group from hash if not passed', () => {
      const params = {
        dataTransferId: 'test-id',
        encryptionPublicKey: 'test-pk',
        factors: [RecoveryFactor.Face, RecoveryFactor.Image, RecoveryFactor.Password],
      }

      const hash = composeUnforgettableLocationHash(params)
      const urlSearchParams = new URLSearchParams(hash.slice(1))

      expect(urlSearchParams.get('id')).toBe(params.dataTransferId)
      expect(urlSearchParams.get('epk')).toBe(params.encryptionPublicKey)
      expect(urlSearchParams.get('f')).toBe(params.factors.join(','))
      expect(urlSearchParams.get('g')).toBeNull()
      expect(hash).toBe('#id=test-id&epk=test-pk&f=1%2C2%2C3')
    })
  })

  describe('parseUnforgettableLocationHash', () => {
    describe('location hash parsing', () => {
      it('parses location hash into a valid params object', () => {
        const parsedParams = parseUnforgettableLocationHash(
          '#id=test-id&epk=test-pk&f=1,2,3&wa=0xabc&g=m',
        )

        expect(parsedParams).toEqual({
          dataTransferId: 'test-id',
          encryptionPublicKey: 'test-pk',
          factors: [1, 2, 3],
          walletAddress: '0xabc',
          group: 'm',
        })
      })

      it('parses without #', () => {
        const parsedParams = parseUnforgettableLocationHash(
          'id=test-id&epk=test-pk&f=1,2,3&wa=0xabc&g=m',
        )

        expect(parsedParams).toEqual({
          dataTransferId: 'test-id',
          encryptionPublicKey: 'test-pk',
          factors: [1, 2, 3],
          walletAddress: '0xabc',
          group: 'm',
        })
      })

      describe('parsing custom params', () => {
        it('parses location hash with custom params into a valid params object', () => {
          const parsedParams = parseUnforgettableLocationHash(
            '#id=test-id&epk=test-pk&f=1,2,3&t=light&t=test-theme&d=test-data&r',
          )

          expect(parsedParams).toEqual({
            dataTransferId: 'test-id',
            encryptionPublicKey: 'test-pk',
            factors: [1, 2, 3],
            customParams: {
              t: 'test-theme',
              d: 'test-data',
              r: '',
            },
          })
        })

        it('parses location hash with custom params and does not overwrite a required path params', () => {
          const parsedParams = parseUnforgettableLocationHash(
            '#id=test-id&epk=original-pk&f=1,2,3&epk=overwritten-pk',
          )

          expect(parsedParams).toEqual({
            dataTransferId: 'test-id',
            encryptionPublicKey: 'original-pk',
            factors: [1, 2, 3],
          })
        })
      })
    })

    it('throws an error if the data transfer ID is missing', () => {
      expect(() => parseUnforgettableLocationHash('#epk=test-pk&f=1,2,3&wa=0xabc')).toThrow(
        'Invalid recovery path parameters',
      )
    })

    it('throws an error if the encrypted public key is missing', () => {
      expect(() => parseUnforgettableLocationHash('#id=test-id&f=1,2,3&wa=0xabc')).toThrow(
        'Invalid recovery path parameters',
      )
    })

    describe('parseFactors', () => {
      it('returns empty array if factors are not provided', () => {
        const parsedParams = parseUnforgettableLocationHash('#id=test-id&epk=test-pk')

        expect(parsedParams.factors).toEqual([])
      })

      it('returns empty array if factors key is provided but empty', () => {
        const parsedParams = parseUnforgettableLocationHash('#id=test-id&epk=test-pk&f=')

        expect(parsedParams.factors).toEqual([])
      })

      it('returns the original order in case of repeated factors', () => {
        const parsedParams = parseUnforgettableLocationHash('#id=test-id&epk=test-pk&f=1,2,3,2,1,3')

        expect(parsedParams.factors).toEqual([1, 2, 3, 2, 1, 3])
      })

      it('ignores empty items in the enumeration', () => {
        const parsedParams = parseUnforgettableLocationHash('#id=test-id&epk=test-pk&f=1,,2,3')

        expect(parsedParams.factors).toEqual([1, 2, 3])
      })

      it('throws an error if the factor is not an integer number', () => {
        const invalidFactor = 'abc'

        expect(() =>
          parseUnforgettableLocationHash(`#id=test-id&epk=test-pk&f=1,${invalidFactor},3`),
        ).toThrow(`Recovery factor id is not an integer: "${invalidFactor}"`)
      })

      it('throws an error if the factor is out of the factors registry range', () => {
        const invalidFactor = Number.MAX_SAFE_INTEGER

        expect(() =>
          parseUnforgettableLocationHash(`#id=test-id&epk=test-pk&f=1,2,${invalidFactor}`),
        ).toThrow(`Invalid recovery factor id: ${invalidFactor}`)
      })
    })
  })
})
