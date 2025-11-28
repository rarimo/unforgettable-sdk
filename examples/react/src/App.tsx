import { RecoveryFactor, UnforgettableMode } from '@rarimo/unforgettable-sdk'
import UnforgettableQrCode from '@rarimo/unforgettable-sdk-react'
import { useCallback, useState } from 'react'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const RECOVERY_FACTORS = [
  { key: RecoveryFactor.Face, label: 'Face' },
  { key: RecoveryFactor.Image, label: 'Image' },
  { key: RecoveryFactor.Password, label: 'Password' },
]

export default function App() {
  const [privateKey, setPrivateKey] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [group, setGroup] = useState('')
  const [selectedFactors, setSelectedFactors] = useState<RecoveryFactor[]>([
    RecoveryFactor.Face,
    RecoveryFactor.Image,
    RecoveryFactor.Password,
  ])

  const [helperDataUrl, setHelperDataUrl] = useState<string>('')
  const [mode, setMode] = useState<UnforgettableMode>('create')

  const toggleFactor = (factor: RecoveryFactor) => {
    setSelectedFactors(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor],
    )
  }

  const handleUnforgettableSuccess = useCallback((key: string, helperDataUrl?: string) => {
    setPrivateKey(key)
    setHelperDataUrl(helperDataUrl ?? '')
    setWalletAddress(privateKeyToAccount(key as Hex).address)
  }, [])

  const handleReset = () => {
    setPrivateKey('')
    setHelperDataUrl('')
    setWalletAddress('')
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4 md:px-0 flex flex-col items-center'>
      <div className='w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 md:p-10 space-y-6'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Unforgettable SDK Example</h1>

        <div className='flex gap-4'>
          {(['create', 'restore'] as UnforgettableMode[]).map(item => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`px-4 py-2 font-medium text-sm rounded-md transition-colors duration-200 ${
                mode === item
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:text-blue-500'
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Recovery Factors Selection */}
        <div className='space-y-2'>
          <h3 className='text-sm font-semibold text-gray-700'>Recovery Factors</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
            {RECOVERY_FACTORS.map(factor => (
              <button
                key={factor.key}
                onClick={() => toggleFactor(factor.key)}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  selectedFactors.includes(factor.key)
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
              >
                {selectedFactors.includes(factor.key) && '✓ '}
                {factor.label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-col md:flex-row items-center md:items-start gap-10'>
          <div className='flex-1 space-y-4'>
            {mode === 'restore' && (
              <div>
                <label className='text-sm font-semibold text-gray-700 block mb-2'>
                  Wallet Address
                </label>
                <input
                  type='text'
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder='0x...'
                  className='border border-gray-300 rounded-md p-2 w-full text-sm'
                />
              </div>
            )}

            <div>
              <label className='text-sm font-semibold text-gray-700 block mb-2'>
                Group (Optional)
              </label>
              <input
                type='text'
                value={group}
                onChange={e => setGroup(e.target.value)}
                placeholder='Enter group identifier'
                className='border border-gray-300 rounded-md p-2 w-full text-sm'
              />
            </div>

            <div className='text-sm text-gray-700 space-y-2'>
              <p>
                <span className='font-semibold'>Mode:</span>{' '}
                <code className='text-blue-600'>{mode}</code>
              </p>
              <p>
                <span className='font-semibold'>Selected Factors:</span>{' '}
                <span className='text-gray-600'>
                  {selectedFactors
                    .map(f => RECOVERY_FACTORS.find(rf => rf.key === f)?.label)
                    .join(', ') || 'None'}
                </span>
              </p>
              {privateKey && (
                <>
                  <p>
                    <span className='font-semibold'>Private key:</span>{' '}
                    <span className='break-all font-mono text-xs'>{privateKey}</span>
                  </p>
                  <p>
                    <span className='font-semibold'>Wallet address:</span>{' '}
                    <span className='break-all font-mono text-xs'>{walletAddress}</span>
                  </p>
                </>
              )}
              {helperDataUrl && (
                <p>
                  <span className='font-semibold'>Helper Data URL:</span>{' '}
                  <a
                    href={helperDataUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='break-all text-blue-600 hover:underline text-xs'
                  >
                    {helperDataUrl}
                  </a>
                </p>
              )}
            </div>

            {privateKey && (
              <button
                onClick={handleReset}
                className='mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm font-medium hover:bg-red-200 transition-colors'
              >
                Reset
              </button>
            )}
          </div>

          {!privateKey && (
            <div className='flex flex-col items-center gap-4'>
              <UnforgettableQrCode
                qrProps={{ size: 200 }}
                mode={mode}
                appUrl={`http://localhost:3000`}
                apiUrl={`https://api.dev.unforgettable.app`}
                factors={selectedFactors}
                walletAddress={mode === 'restore' ? walletAddress || undefined : undefined}
                group={group || undefined}
                onSuccess={handleUnforgettableSuccess}
                onError={error => console.error(error)}
              />
              {selectedFactors.length === 0 && (
                <p className='text-sm text-red-600'>Please select at least one factor</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
