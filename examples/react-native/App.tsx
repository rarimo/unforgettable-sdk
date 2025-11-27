import 'react-native-get-random-values'
import 'react-native-url-polyfill/auto'
import 'fastestsmallesttextencoderdecoder'

import { Buffer } from 'buffer'
global.Buffer = Buffer

import { RecoveryFactor, UnforgettableMode, UnforgettableSdk } from '@rarimo/unforgettable-sdk'
import React, { useEffect, useState } from 'react'
import {
  Clipboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const RECOVERY_FACTORS = [
  { key: RecoveryFactor.Face, label: 'Face' },
  { key: RecoveryFactor.Image, label: 'Image' },
  { key: RecoveryFactor.Password, label: 'Password' },
]

function App(): React.JSX.Element {
  const [mode, setMode] = useState<UnforgettableMode>('create')
  const [selectedFactors, setSelectedFactors] = useState<RecoveryFactor[]>([
    RecoveryFactor.Face,
    RecoveryFactor.Image,
    RecoveryFactor.Password,
  ])
  const [walletAddress, setWalletAddress] = useState('')
  const [group, setGroup] = useState('')
  const [recoveryUrl, setRecoveryUrl] = useState('')
  const [showWebView, setShowWebView] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [recoveredKey, setRecoveredKey] = useState('')
  const [recoveredAddress, setRecoveredAddress] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [sdk, setSdk] = useState<UnforgettableSdk | null>(null)

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout

    if (isPolling && sdk) {
      pollingInterval = setInterval(async () => {
        try {
          const data = await sdk.getRecoveredData()
          setRecoveredKey(data.recoveryKey)
          setRecoveredAddress(privateKeyToAccount(data.recoveryKey as Hex).address)
          setStatusMessage('✅ Recovery successful!')
          setIsPolling(false)
          setShowWebView(false)
        } catch (error) {
          const errorObj = error as { httpStatus?: number; name?: string; message?: string }
          // Check if it's a 404 error (data not found yet)
          if (errorObj.httpStatus === 404 || errorObj.name === 'NotFoundError') {
            // Continue polling
            return
          }
          // Other errors - stop polling
          console.error('Recovery error:', error)
          setErrorMessage(`Recovery failed: ${errorObj.message || 'Unknown error'}`)
          setIsPolling(false)
          setShowWebView(false)
        }
      }, 2000)
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [isPolling, sdk])

  const toggleFactor = (factor: RecoveryFactor) => {
    setSelectedFactors(prev =>
      prev.includes(factor) ? prev.filter(f => f !== factor) : [...prev, factor],
    )
  }

  const generateRecoveryUrl = async () => {
    setErrorMessage('')
    setStatusMessage('')
    setRecoveredKey('')
    setRecoveredAddress('')

    if (selectedFactors.length === 0) {
      setErrorMessage('Please select at least one recovery factor')
      return
    }

    try {
      const newSdk = new UnforgettableSdk({
        mode,
        factors: selectedFactors,
        walletAddress: walletAddress || undefined,
        group: group || undefined,
      })

      setSdk(newSdk)
      const url = await newSdk.getRecoveryUrl()
      setRecoveryUrl(url)
      setStatusMessage('Recovery URL generated successfully!')
    } catch (error) {
      const err = error as Error
      setErrorMessage(`Failed to generate URL: ${err.message}`)
    }
  }

  const openWebView = () => {
    if (!recoveryUrl) {
      setErrorMessage('Please generate a recovery URL first')
      return
    }
    setShowWebView(true)
    setIsPolling(true)
  }

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text)
    setStatusMessage(`${label} copied to clipboard!`)
    setTimeout(() => setStatusMessage(''), 3000)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
      <ScrollView contentInsetAdjustmentBehavior='automatic' style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Unforgettable Recovery</Text>

          {/* Mode Selection */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recovery Mode</Text>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
                onPress={() => setMode('create')}
              >
                <Text
                  style={[styles.modeButtonText, mode === 'create' && styles.modeButtonTextActive]}
                >
                  Create
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, mode === 'restore' && styles.modeButtonActive]}
                onPress={() => setMode('restore')}
              >
                <Text
                  style={[styles.modeButtonText, mode === 'restore' && styles.modeButtonTextActive]}
                >
                  Restore
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recovery Factors */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recovery Factors</Text>
            {RECOVERY_FACTORS.map(factor => (
              <TouchableOpacity
                key={factor.key}
                style={styles.factorRow}
                onPress={() => toggleFactor(factor.key)}
              >
                <Text style={styles.factorLabel}>{factor.label}</Text>
                <View style={styles.checkbox}>
                  {selectedFactors.includes(factor.key) && <View style={styles.checkboxChecked} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optional Inputs */}
          {mode === 'restore' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Wallet Address (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder='0x...'
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize='none'
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Group (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder='Enter group identifier'
              value={group}
              onChangeText={setGroup}
              autoCapitalize='none'
              autoCorrect={false}
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity style={styles.primaryButton} onPress={generateRecoveryUrl}>
            <Text style={styles.primaryButtonText}>Generate Recovery URL</Text>
          </TouchableOpacity>

          {/* Recovery URL */}
          {recoveryUrl && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recovery URL</Text>
              <Text style={styles.urlText} numberOfLines={3}>
                {recoveryUrl}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => copyToClipboard(recoveryUrl, 'URL')}
                >
                  <Text style={styles.secondaryButtonText}>Copy URL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={openWebView}>
                  <Text style={styles.secondaryButtonText}>Open in WebView</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Status Messages */}
          {statusMessage && (
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          )}

          {errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Polling Status */}
          {isPolling && (
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>⏳ Polling for recovery data...</Text>
            </View>
          )}

          {/* Recovered Data */}
          {recoveredKey && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recovered Private Key</Text>
              <Text style={styles.keyText} numberOfLines={2}>
                {recoveredKey}
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => copyToClipboard(recoveredKey, 'Private Key')}
              >
                <Text style={styles.secondaryButtonText}>Copy Key</Text>
              </TouchableOpacity>

              {recoveredAddress && (
                <>
                  <Text style={[styles.cardTitle, styles.addressTitle]}>Wallet Address</Text>
                  <Text style={styles.keyText} numberOfLines={1}>
                    {recoveredAddress}
                  </Text>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => copyToClipboard(recoveredAddress, 'Address')}
                  >
                    <Text style={styles.secondaryButtonText}>Copy Address</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* WebView Modal */}
      <Modal
        visible={showWebView}
        animationType='slide'
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Recovery Process</Text>
            <TouchableOpacity onPress={() => setShowWebView(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: recoveryUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            mediaCapturePermissionGrantType='grant'
            allowsProtectedMedia={true}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  factorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  factorLabel: {
    fontSize: 14,
    color: '#333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urlText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 8,
  },
  keyText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 8,
  },
  addressTitle: {
    marginTop: 16,
  },
  statusCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusText: {
    color: '#2e7d32',
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#333',
  },
  webview: {
    flex: 1,
  },
})

export default App
