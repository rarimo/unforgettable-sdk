import { pki } from 'node-forge'

export interface DataTransferKeyPair {
  publicKey: string
  encrypt(data: string): string
  decrypt(encryptedData: string): string
}

export function generateDataTransferKeyPair(bits = 2048): Promise<DataTransferKeyPair> {
  return new Promise<DataTransferKeyPair>((resolve, reject) => {
    pki.rsa.generateKeyPair({ bits }, (err, keypair) => {
      if (err) return reject(err)

      resolve({
        publicKey: pemToBase64Url(pki.publicKeyToPem(keypair.publicKey)),
        encrypt: (data: string) => keypair.publicKey.encrypt(data),
        decrypt: (encryptedData: string) => keypair.privateKey.decrypt(encryptedData),
      })
    })
  })
}

export function encryptDataTransferData(publicKey: string, data: string): string {
  const keyPairPublicKey = pki.publicKeyFromPem(base64UrlToPem(publicKey))
  return keyPairPublicKey.encrypt(data)
}

function base64UrlToPem(base64Url: string): string {
  let b64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='

  return [
    '-----BEGIN PUBLIC KEY-----',
    ...(b64.match(/.{1,64}/g) || []),
    '-----END PUBLIC KEY-----',
    '',
  ].join('\n')
}

function pemToBase64Url(pem: string): string {
  return pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\r?\n|\r/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
