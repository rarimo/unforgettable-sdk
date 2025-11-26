import SwiftUI
import UnforgettableSDK

@MainActor
class RecoveryViewModel: ObservableObject {
  @Published var mode: UnforgettableMode = .create
  @Published var selectedFactors: Set<RecoveryFactor> = [.face, .password]
  @Published var walletAddress: String = ""
  @Published var group: String = ""
    
  @Published var recoveryUrl: String = ""
  @Published var isWebViewPresented: Bool = false
  @Published var isPolling: Bool = false
  @Published var recoveredKey: String = ""
  @Published var recoveredWalletAddress: String = ""
  @Published var errorMessage: String = ""
  @Published var statusMessage: String = ""
    
  private var sdk: UnforgettableSDK?
  private nonisolated(unsafe) var pollingTask: Task<Void, Never>?
    
  var allFactors: [RecoveryFactor] {
    [.face, .image, .password]
  }
    
  func generateRecoveryUrl() {
    errorMessage = ""
    statusMessage = ""
    recoveredKey = ""
    recoveredWalletAddress = ""
        
    guard !selectedFactors.isEmpty else {
      errorMessage = "Please select at least one recovery factor"
      return
    }
        
    do {
      let options = UnforgettableSdkOptions(
        mode: mode,
        factors: Array(selectedFactors),
        walletAddress: walletAddress.isEmpty ? nil : walletAddress,
        group: group.isEmpty ? nil : group
      )
            
      sdk = try UnforgettableSDK(options: options)
      recoveryUrl = sdk!.getRecoveryUrl()
      statusMessage = "Recovery URL generated successfully!"
            
    } catch {
      errorMessage = "Failed to generate URL: \(error.localizedDescription)"
    }
  }
    
  func openInWebView() {
    guard !recoveryUrl.isEmpty else { return }
    isWebViewPresented = true
        
    // Start polling in both create and restore modes
    startPolling()
  }
    
  func startPolling() {
    guard let sdk = sdk else { return }
        
    stopPolling()
    isPolling = true
    statusMessage = "Waiting for recovery data..."
        
    pollingTask = Task {
      while !Task.isCancelled && isPolling {
        do {
          let recoveredData = try await sdk.getRecoveredData()
                    
          await MainActor.run {
            self.recoveredKey = recoveredData.recoveryKey
            self.recoveredWalletAddress = self.walletAddress
            self.statusMessage = "✅ Recovery successful!"
            self.isPolling = false
            self.isWebViewPresented = false
                        
            if let helperDataUrl = recoveredData.helperDataUrl {
              self.statusMessage += "\n\nHelper Data URL: \(helperDataUrl)"
            }
          }
          break
                    
        } catch UnforgettableSDKError.notFound {
          // Data not available yet, continue polling
          try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
                    
        } catch {
          await MainActor.run {
            self.errorMessage = "Recovery failed: \(error.localizedDescription)"
            self.isPolling = false
          }
          break
        }
      }
    }
  }
    
  func stopPolling() {
    pollingTask?.cancel()
    pollingTask = nil
    isPolling = false
  }
    
  func copyToClipboard(_ text: String) {
    #if os(iOS)
    UIPasteboard.general.string = text
    #elseif os(macOS)
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(text, forType: .string)
    #endif
    statusMessage = "Copied to clipboard!"
  }
    
  deinit {
    pollingTask?.cancel()
  }
}
