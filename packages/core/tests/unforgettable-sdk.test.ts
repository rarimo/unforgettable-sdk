import { errors, JsonApiClient } from '@distributedlab/jac'

import { UnforgettableSdk } from '../src'
import * as LocationHash from '../src/location-hash'
import * as Utils from '../src/utils'

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}))

describe('UnforgettableSdk', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('constructor', () => {
    it('initializes in "create" mode', () => {
      const sdk = new UnforgettableSdk({ mode: 'create' })

      expect(sdk.mode).toBe('create')
    })

    it('initializes in "restore" mode', () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })

      expect(sdk.mode).toBe('restore')
    })

    it('uses custom appUrl when provided', () => {
      const customAppUrl = 'https://app.custom'
      const sdk = new UnforgettableSdk({ mode: 'create', appUrl: customAppUrl })

      expect(sdk.appUrl).toBe(customAppUrl)
    })

    it('uses provided factors array', () => {
      const factors = [1, 2, 3]
      const sdk = new UnforgettableSdk({ mode: 'create', factors })

      expect(sdk.factors).toEqual(factors)
    })

    it('stores provided wallet address', () => {
      const walletAddress = '0xabc'
      const sdk = new UnforgettableSdk({ mode: 'create', walletAddress })

      expect(sdk.walletAddress).toBe(walletAddress)
    })
  })

  describe('getRecoveryUrl', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'generateDataTransferKeyPair').mockResolvedValue({
        publicKey: 'mock-public-key',
        encrypt: () => 'mock-encrypted',
        decrypt: () => 'mock-decrypted',
      })
    })

    it('returns URL in "create" mode', async () => {
      const composeSpy = jest
        .spyOn(LocationHash, 'composeUnforgettableLocationHash')
        .mockReturnValue('#id=mock-uuid&epk=mock-public-key&f=1,2,3&wa=0xabc')

      const sdk = new UnforgettableSdk({
        mode: 'create',
        factors: [1, 2, 3],
        walletAddress: '0xabc',
      })

      const recoveryUrl = await sdk.getRecoveryUrl()

      expect(recoveryUrl).toBe(
        'https://unforgettable.app/c#id=mock-uuid&epk=mock-public-key&f=1,2,3&wa=0xabc',
      )
      expect(composeSpy).toHaveBeenCalledTimes(1)
      expect(composeSpy).toHaveBeenCalledWith({
        dataTransferId: 'mock-uuid',
        encryptionPublicKey: 'mock-public-key',
        factors: [1, 2, 3],
        walletAddress: '0xabc',
      })
    })

    it('returns URL in "restore" mode', async () => {
      const composeSpy = jest
        .spyOn(LocationHash, 'composeUnforgettableLocationHash')
        .mockReturnValue('#id=mock-uuid&epk=mock-public-key&f=1%2C2%2C3&wa=0xabc')
      const sdk = new UnforgettableSdk({
        mode: 'restore',
        factors: [1, 2, 3],
        walletAddress: '0xabc',
      })

      const recoveryUrl = await sdk.getRecoveryUrl()

      expect(recoveryUrl).toBe(
        'https://unforgettable.app/r#id=mock-uuid&epk=mock-public-key&f=1%2C2%2C3&wa=0xabc',
      )
      expect(composeSpy).toHaveBeenCalledTimes(1)
      expect(composeSpy).toHaveBeenCalledWith({
        dataTransferId: 'mock-uuid',
        encryptionPublicKey: 'mock-public-key',
        factors: [1, 2, 3],
        walletAddress: '0xabc',
      })
    })

    it('returns URL with custom app URL', async () => {
      const sdk = new UnforgettableSdk({
        mode: 'create',
        factors: [1, 2, 3],
        appUrl: 'https://app.custom',
      })

      const recoveryUrl = await sdk.getRecoveryUrl()

      expect(recoveryUrl).toBe('https://app.custom/c#id=mock-uuid&epk=mock-public-key&f=1%2C2%2C3')
    })

    it('returns URL with custom app URL path', async () => {
      const sdk = new UnforgettableSdk({
        mode: 'create',
        factors: [1, 2, 3],
        appUrl: 'https://app.custom/page/',
      })

      const recoveryUrl = await sdk.getRecoveryUrl()

      expect(recoveryUrl).toBe(
        'https://app.custom/page/c#id=mock-uuid&epk=mock-public-key&f=1%2C2%2C3',
      )
    })
  })

  describe('getRecoveredData', () => {
    beforeEach(() => {
      jest.spyOn(Utils, 'generateDataTransferKeyPair').mockResolvedValue({
        publicKey: 'mock-public-key',
        encrypt: s => `${s}-encrypted`,
        decrypt: s => s.replace(/-encrypted$/, ''),
      })
    })

    it('fetches payload, decrypts the key, and returns structured data', async () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })
      const jsonApiClientGetSpy = jest.spyOn(JsonApiClient.prototype, 'get').mockResolvedValue({
        data: {
          id: 'mock-uuid',
          data: JSON.stringify({
            recovery_key: 'secret-encrypted',
            helper_data_url: 'https://helper-data',
          }),
        },
      } as never)

      const result = await sdk.getRecoveredData()

      expect(jsonApiClientGetSpy).toHaveBeenCalledWith(
        '/integrations/helper-keeper/v1/public/data-transfers/mock-uuid',
      )
      expect(result).toEqual({
        recoveryKey: 'secret',
        helperDataUrl: 'https://helper-data',
      })
    })

    it('rejects with NotFoundError when backend returns no data', async () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })

      jest.spyOn(JsonApiClient.prototype, 'get').mockResolvedValue({ data: undefined } as never)

      await expect(sdk.getRecoveredData()).rejects.toBe(errors.NotFoundError)
    })
  })

  describe('getRecoveredKey', () => {
    it('returns decrypted recovery key', async () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })

      const getRecoveredDataSpy = jest
        .spyOn(sdk, 'getRecoveredData')
        .mockResolvedValue({ recoveryKey: 'recovery-key' as const, helperDataUrl: undefined })

      const key = await sdk.getRecoveredKey()

      expect(key).toBe('recovery-key')
      expect(getRecoveredDataSpy).toHaveBeenCalledTimes(1)
    })
  })
})
