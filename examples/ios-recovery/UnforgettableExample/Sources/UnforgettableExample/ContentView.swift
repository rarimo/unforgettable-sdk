import SwiftUI
import UnforgettableSDK

struct ContentView: View {
  @StateObject private var viewModel = RecoveryViewModel()
    
  var body: some View {
    NavigationView {
      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          // Mode Selection
          VStack(alignment: .leading, spacing: 8) {
            Text("Recovery Mode")
              .font(.headline)
                        
            Picker("Mode", selection: $viewModel.mode) {
              Text("Create").tag(UnforgettableMode.create)
              Text("Restore").tag(UnforgettableMode.restore)
            }
            .pickerStyle(.segmented)
          }
                    
          // Recovery Factors
          VStack(alignment: .leading, spacing: 8) {
            Text("Recovery Factors")
              .font(.headline)
                        
            ForEach(viewModel.allFactors, id: \.self) { factor in
              Toggle(factorName(factor), isOn: Binding(
                get: { viewModel.selectedFactors.contains(factor) },
                set: { isSelected in
                  if isSelected {
                    viewModel.selectedFactors.insert(factor)
                  } else {
                    viewModel.selectedFactors.remove(factor)
                  }
                }
              ))
            }
          }
                    
          // Optional Fields
          VStack(alignment: .leading, spacing: 8) {
            Text("Optional Parameters")
              .font(.headline)
                        
            if viewModel.mode == .restore {
              TextField("Wallet Address", text: $viewModel.walletAddress)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
            }
                        
            TextField("Group", text: $viewModel.group)
              .textFieldStyle(.roundedBorder)
              .autocapitalization(.none)
          }
                    
          // Generate Button
          Button(action: viewModel.generateRecoveryUrl) {
            Text("Generate Recovery URL")
              .frame(maxWidth: .infinity)
              .padding()
              .background(Color.blue)
              .foregroundColor(.white)
              .cornerRadius(10)
          }
                    
          // URL Display
          if !viewModel.recoveryUrl.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
              Text("Generated URL")
                .font(.headline)
                            
              Text(viewModel.recoveryUrl)
                .font(.caption)
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
                .textSelection(.enabled)
                            
              HStack(spacing: 12) {
                Button(action: {
                  viewModel.copyToClipboard(viewModel.recoveryUrl)
                }) {
                  Label("Copy", systemImage: "doc.on.doc")
                }
                .buttonStyle(.bordered)
                                
                Button(action: viewModel.openInWebView) {
                  Label("Open in WebView", systemImage: "safari")
                }
                .buttonStyle(.borderedProminent)
              }
            }
          }
                    
          // Status Messages
          if !viewModel.statusMessage.isEmpty {
            Text(viewModel.statusMessage)
              .font(.callout)
              .foregroundColor(.green)
              .padding()
              .frame(maxWidth: .infinity)
              .background(Color.green.opacity(0.1))
              .cornerRadius(8)
          }
                    
          // Error Messages
          if !viewModel.errorMessage.isEmpty {
            Text(viewModel.errorMessage)
              .font(.callout)
              .foregroundColor(.red)
              .padding()
              .frame(maxWidth: .infinity)
              .background(Color.red.opacity(0.1))
              .cornerRadius(8)
          }
                    
          // Polling Status
          if viewModel.isPolling {
            HStack {
              ProgressView()
              Text("Polling for recovery data...")
                .font(.callout)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.blue.opacity(0.1))
            .cornerRadius(8)
                        
            Button(action: viewModel.stopPolling) {
              Text("Stop Polling")
                .foregroundColor(.red)
            }
            .buttonStyle(.bordered)
          }
                    
          // Recovered Key Display
          if !viewModel.recoveredKey.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
              Text("Recovered Private Key")
                .font(.headline)
                            
              Text(viewModel.recoveredKey)
                .font(.system(.body, design: .monospaced))
                .padding()
                .background(Color.green.opacity(0.1))
                .cornerRadius(8)
                .textSelection(.enabled)
                            
              Button(action: {
                viewModel.copyToClipboard(viewModel.recoveredKey)
              }) {
                Label("Copy Key", systemImage: "doc.on.doc")
              }
              .buttonStyle(.bordered)
                            
              if !viewModel.recoveredWalletAddress.isEmpty {
                Divider()
                  .padding(.vertical, 4)
                                
                Text("Wallet Address")
                  .font(.headline)
                                
                Text(viewModel.recoveredWalletAddress)
                  .font(.system(.body, design: .monospaced))
                  .padding()
                  .background(Color.blue.opacity(0.1))
                  .cornerRadius(8)
                  .textSelection(.enabled)
                                
                Button(action: {
                  viewModel.copyToClipboard(viewModel.recoveredWalletAddress)
                }) {
                  Label("Copy Address", systemImage: "doc.on.doc")
                }
                .buttonStyle(.bordered)
              }
            }
          }
        }
        .padding()
      }
      .navigationTitle("Unforgettable Recovery")
      .sheet(isPresented: $viewModel.isWebViewPresented) {
        WebViewSheet(url: viewModel.recoveryUrl, isPresented: $viewModel.isWebViewPresented)
      }
    }
  }
    
  private func factorName(_ factor: RecoveryFactor) -> String {
    switch factor {
    case .face: return "Face"
    case .image: return "Image"
    case .password: return "Password"
    case .object: return "Object"
    case .book: return "Book"
    case .geolocation: return "Geolocation"
    }
  }
}

struct ContentView_Previews: PreviewProvider {
  static var previews: some View {
    ContentView()
  }
}
