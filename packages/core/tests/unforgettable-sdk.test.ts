import { UnforgettableSdk } from '../src'

type ApiInstance = { baseUrl: string; get: jest.Mock }

const apiInstances: ApiInstance[] = []
const mockComposeUnforgettableLocationHash = jest.fn(() => '#mock-hash')
const mockKeyPair = {
  publicKey: 'public-key-in-base64url',
  encrypt: (s: string) => `enc(${s})`,
  decrypt: (s: string) => {
    const m = /^enc\((.*)\)$/.exec(s)
    if (!m) throw new Error('Invalid ciphertext')
    return m[1]
  },
}
const mockGenerateDataTransferKeyPair = jest.fn(async () => mockKeyPair)

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'e2a11365-c64b-40b7-82fc-7cf2bd455449'),
}))

jest.mock('../src/constants', () => ({
  UNFORGETTABLE_API_URL: 'https://api.default',
  UNFORGETTABLE_APP_URL: 'https://app.default',
}))

jest.mock('../src/location-hash', () => ({
  composeUnforgettableLocationHash: (...args: []) => mockComposeUnforgettableLocationHash(...args),
}))

jest.mock('../src/utils', () => ({
  generateDataTransferKeyPair: (...args: []) => mockGenerateDataTransferKeyPair(...args),
}))

jest.mock('@distributedlab/jac', () => {
  const JsonApiClient = jest.fn().mockImplementation((opts: { baseUrl: string }) => {
    const inst = { baseUrl: opts.baseUrl, get: jest.fn() }
    apiInstances.push(inst)
    return inst
  })

  const errors = { NotFoundError: new Error('NotFoundError') }

  return {
    JsonApiClient,
    errors,
  }
})

describe('The UnforgettableSdk', () => {
  beforeEach(() => {
    apiInstances.length = 0
    jest.clearAllMocks()
  })

  describe('constructor()', () => {
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

    it('uses custom apiUrl when provided (JsonApiClient baseUrl)', () => {
      new UnforgettableSdk({ mode: 'create', apiUrl: 'https://api.custom' })

      expect(apiInstances).toHaveLength(1)
      expect(apiInstances[0].baseUrl).toBe('https://api.custom')
    })
  })

  describe('getRecoveryUrl()', () => {
    it('returns valid URL with valid arguments in "create" mode', async () => {
      const sdk = new UnforgettableSdk({
        mode: 'create',
        factors: [1, 2, 3],
        walletAddress: '0xabc',
      })

      const recoveryUrl = await sdk.getRecoveryUrl()
      const urlComponents = (mockComposeUnforgettableLocationHash as jest.Mock).mock.calls[0][0]

      expect(recoveryUrl).toBe('https://app.default/c#mock-hash')
      expect(urlComponents).toMatchObject({
        dataTransferId: 'e2a11365-c64b-40b7-82fc-7cf2bd455449',
        encryptionPublicKey: mockKeyPair.publicKey,
        factors: [1, 2, 3],
        walletAddress: '0xabc',
      })
    })

    it('returns valid URL with valid arguments in "restore" mode', async () => {
      const sdk = new UnforgettableSdk({
        mode: 'restore',
        appUrl: 'https://app.custom',
      })

      const recoveryUrl = await sdk.getRecoveryUrl()
      const args = (mockComposeUnforgettableLocationHash as jest.Mock).mock.calls[0][0]

      expect(recoveryUrl).toBe('https://app.custom/r#mock-hash')
      expect(args).toMatchObject({
        dataTransferId: 'e2a11365-c64b-40b7-82fc-7cf2bd455449',
        encryptionPublicKey: mockKeyPair.publicKey,
      })
    })
  })

  describe('getRecoveredData()', () => {
    it('fetches payload, decrypts the key, and returns structured data', async () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })

      apiInstances[0].get.mockResolvedValue({
        data: {
          id: 'e2a11365-c64b-40b7-82fc-7cf2bd455449',
          data: JSON.stringify({
            recovery_key: mockKeyPair.encrypt('secret-key'),
            helper_data_url: 'https://helper-data',
          }),
        },
      })

      const result = await sdk.getRecoveredData()

      expect(apiInstances[0].baseUrl).toBe('https://api.default')
      expect(result).toEqual({
        recoveryKey: 'secret-key',
        helperDataUrl: 'https://helper-data',
      })
      expect(apiInstances[0].get).toHaveBeenCalledWith(
        '/integrations/helper-keeper/v1/public/data-transfers/e2a11365-c64b-40b7-82fc-7cf2bd455449',
      )
    })

    it('rejects with NotFoundError when backend returns no data', async () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })

      apiInstances[0].get.mockResolvedValue({ data: undefined })

      await expect(sdk.getRecoveredData()).rejects.toThrow('NotFoundError')
    })
  })

  describe('getRecoveredKey()', () => {
    it('returns decrypted recovery key', async () => {
      const sdk = new UnforgettableSdk({ mode: 'restore' })

      apiInstances[0].get.mockResolvedValue({
        data: {
          id: 'e2a11365-c64b-40b7-82fc-7cf2bd455449',
          data: JSON.stringify({
            recovery_key: mockKeyPair.encrypt('recovery-key'),
          }),
        },
      })

      const key = await sdk.getRecoveredKey()

      expect(key).toBe('recovery-key')
    })
  })
})
