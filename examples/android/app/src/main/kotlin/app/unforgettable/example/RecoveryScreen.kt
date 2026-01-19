package app.unforgettable.example

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rarimo.unforgettable.RecoveryFactor
import com.rarimo.unforgettable.UnforgettableMode

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RecoveryScreen(
    viewModel: RecoveryViewModel = viewModel()
) {
    val context = LocalContext.current
    val mode by viewModel.mode.collectAsState()
    val selectedFactors by viewModel.selectedFactors.collectAsState()
    val walletAddress by viewModel.walletAddress.collectAsState()
    val group by viewModel.group.collectAsState()
    val recoveryUrl by viewModel.recoveryUrl.collectAsState()
    val isWebViewVisible by viewModel.isWebViewVisible.collectAsState()
    val isPolling by viewModel.isPolling.collectAsState()
    val recoveredKey by viewModel.recoveredKey.collectAsState()
    val recoveredWalletAddress by viewModel.recoveredWalletAddress.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Unforgettable Recovery") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Mode Selection
            Card {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Recovery Mode", style = MaterialTheme.typography.titleMedium)
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        FilterChip(
                            selected = mode == UnforgettableMode.CREATE,
                            onClick = { viewModel.setMode(UnforgettableMode.CREATE) },
                            label = { Text("Create") },
                            modifier = Modifier.weight(1f)
                        )
                        FilterChip(
                            selected = mode == UnforgettableMode.RESTORE,
                            onClick = { viewModel.setMode(UnforgettableMode.RESTORE) },
                            label = { Text("Restore") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
            
            // Recovery Factors
            Card {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Recovery Factors", style = MaterialTheme.typography.titleMedium)
                    
                    viewModel.allFactors.forEach { factor ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(factorName(factor))
                            Checkbox(
                                checked = selectedFactors.contains(factor),
                                onCheckedChange = { viewModel.toggleFactor(factor) }
                            )
                        }
                    }
                }
            }
            
            // Optional Parameters
            Card {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Optional Parameters", style = MaterialTheme.typography.titleMedium)
                    
                    if (mode == UnforgettableMode.RESTORE) {
                        OutlinedTextField(
                            value = walletAddress,
                            onValueChange = { viewModel.setWalletAddress(it) },
                            label = { Text("Wallet Address") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true
                        )
                    }
                    
                    OutlinedTextField(
                        value = group,
                        onValueChange = { viewModel.setGroup(it) },
                        label = { Text("Group") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            }
            
            // Generate Button
            Button(
                onClick = { viewModel.generateRecoveryUrl() },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Generate Recovery URL")
            }
            
            // URL Display
            if (recoveryUrl.isNotEmpty()) {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Generated URL", style = MaterialTheme.typography.titleMedium)
                        
                        Text(
                            text = recoveryUrl,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp)
                        )
                        
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = {
                                    copyToClipboard(context, recoveryUrl)
                                    viewModel.setStatusMessage("Copied to clipboard!")
                                }
                            ) {
                                Icon(Icons.Default.ContentCopy, contentDescription = null)
                                Spacer(Modifier.width(4.dp))
                                Text("Copy")
                            }
                            
                            Button(
                                onClick = { viewModel.openInWebView() }
                            ) {
                                Text("Open in WebView")
                            }
                        }
                    }
                }
            }
            
            // Status Messages
            if (statusMessage.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Text(
                        text = statusMessage,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }
            }
            
            // Error Messages
            if (errorMessage.isNotEmpty()) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = errorMessage,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
            
            // Polling Status
            if (isPolling) {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            Text("Polling for recovery data...")
                        }
                        
                        OutlinedButton(
                            onClick = { viewModel.stopPolling() }
                        ) {
                            Text("Stop Polling", color = MaterialTheme.colorScheme.error)
                        }
                    }
                }
            }
            
            // Recovered Key Display
            if (recoveredKey.isNotEmpty()) {
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text("Recovered Private Key", style = MaterialTheme.typography.titleMedium)
                        
                        Text(
                            text = recoveredKey,
                            fontFamily = FontFamily.Monospace,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp)
                        )
                        
                        OutlinedButton(
                            onClick = {
                                copyToClipboard(context, recoveredKey)
                                viewModel.setStatusMessage("Copied to clipboard!")
                            }
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = null)
                            Spacer(Modifier.width(4.dp))
                            Text("Copy Key")
                        }
                        
                        if (recoveredWalletAddress.isNotEmpty()) {
                            Divider()
                            
                            Text("Wallet Address", style = MaterialTheme.typography.titleMedium)
                            
                            Text(
                                text = recoveredWalletAddress,
                                fontFamily = FontFamily.Monospace,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp)
                            )
                            
                            OutlinedButton(
                                onClick = {
                                    copyToClipboard(context, recoveredWalletAddress)
                                    viewModel.setStatusMessage("Copied to clipboard!")
                                }
                            ) {
                                Icon(Icons.Default.ContentCopy, contentDescription = null)
                                Spacer(Modifier.width(4.dp))
                                Text("Copy Address")
                            }
                        }
                    }
                }
            }
        }
        
        // WebView Dialog
        if (isWebViewVisible) {
            WebViewDialog(
                url = recoveryUrl,
                onDismiss = { viewModel.closeWebView() }
            )
        }
    }
}

private fun factorName(factor: RecoveryFactor): String {
    return when (factor) {
        RecoveryFactor.FACE -> "Face"
        RecoveryFactor.IMAGE -> "Image"
        RecoveryFactor.PASSWORD -> "Password"
    }
}

private fun copyToClipboard(context: Context, text: String) {
    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    val clip = ClipData.newPlainText("Unforgettable", text)
    clipboard.setPrimaryClip(clip)
}
