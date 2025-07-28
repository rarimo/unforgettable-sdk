import { UnforgettableMode } from '@rarimo/unforgettable-sdk'
import UnforgettableQrCode from '@rarimo/unforgettable-sdk-react'
import { useCallback, useState } from 'react'

export default function App() {
  const [masterSeed, setMasterSeed] = useState('')
  const [mode, setMode] = useState<UnforgettableMode>('create')

  const handleUnforgettableSuccess = useCallback((masterSeed: string) => {
    setMasterSeed(masterSeed)
  }, [])

  const handleReset = () => {
    setMasterSeed('')
  }

  return (
    <div className='min-h-screen bg-gray-50 py-10 px-4 md:px-0 flex flex-col items-center'>
      <div className='w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 md:p-10 space-y-6'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Unforgettable SDK Example</h1>

        <div className='flex gap-4'>
          {['create', 'restore'].map(item => (
            <button
              key={item}
              onClick={() => setMode(item as UnforgettableMode)}
              className={`px-4 py-2 font-medium text-sm rounded-md transition-colors duration-200 ${
                mode === item
                  ? 'bg-white border border-gray-300 text-blue-600'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className='flex flex-col md:flex-row items-center md:items-start gap-10'>
          <div className='flex-1 space-y-4'>
            <div className='text-sm text-gray-700'>
              <p>
                <span className='font-semibold'>Master seed:</span>{' '}
                <span className='break-all'>{masterSeed || '—'}</span>
              </p>
              <p>
                <span className='font-semibold'>Mode:</span>{' '}
                <code className='text-blue-600'>{mode}</code>
              </p>
            </div>

            {masterSeed && (
              <button
                onClick={handleReset}
                className='mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-md text-sm font-medium hover:bg-red-200 transition-colors'
              >
                Reset
              </button>
            )}
          </div>

          {!masterSeed && (
            <UnforgettableQrCode
              qrProps={{ size: 200 }}
              mode={mode}
              onSuccess={handleUnforgettableSuccess}
              onError={error => console.error(error)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
