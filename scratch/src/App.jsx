import { SignedIn, SignedOut, SignIn, useUser } from '@clerk/clerk-react';
import { useVaultData, FREE_DOC_LIMIT } from './hooks/useVaultData.js';
import Sidebar from './Components/Sidebar.jsx';
import VaultView from './Components/VaultView.jsx';
import CredentialsView from './Components/CredentialsView.jsx';
import { AuditLogsView, UpgradeView } from './Components/LogsAndUpgrade.jsx';
import PreviewModal from './Components/previewModal.jsx';
import './App.css';

export default function App() {
  const { user } = useUser();
  const vault = useVaultData(user);

  return (
    <>
      <SignedOut>
        <div className="auth-wrapper"><SignIn routing="hash" /></div>
      </SignedOut>

      <SignedIn>
        <div className="app-layout">
          <Sidebar 
            activeTab={vault.activeTab} 
            setActiveTab={vault.setActiveTab} 
            userPlan={vault.userPlan} 
            userEmail={vault.userEmail} 
            isAdmin={vault.isAdmin} 
            docCount={vault.documents.length} 
            freeLimit={FREE_DOC_LIMIT} 
            showNotice={vault.showNotice} 
          />

          <main className="content-area">
            {vault.notification && <div className="toast-notification">{vault.notification}</div>}
            {vault.loading && <p className="loading-state">Synchronizing Vault...</p>}

            {vault.activeTab === 'vault' && (
              <VaultView 
                documents={vault.documents} 
                folders={vault.folders}
                addFolder={vault.addFolder} 
                deleteFolder={vault.deleteFolder}
                addDocument={vault.addDocument} 
                deleteDocument={vault.deleteDocument}
                renameDocument={vault.renameDocument} 
                handleDownload={vault.handleDownload} 
                setPreviewDoc={vault.setPreviewDoc} 
                userPlan={vault.userPlan}
              />
            )}

            {vault.activeTab === 'credentials' && (
              <CredentialsView 
                credentials={vault.credentials}
                addCredential={vault.addCredential}
                toggleCredentialVisibility={vault.toggleCredentialVisibility}
                copyCredentialSecret={vault.copyCredentialSecret}
              />
            )}

            {vault.activeTab === 'logs' && <AuditLogsView activityLogs={vault.activityLogs} />}
            
            {vault.activeTab === 'upgrade' && (
              <UpgradeView 
                userPlan={vault.userPlan} 
                setUserPlan={vault.setUserPlan} 
                showNotice={vault.showNotice} 
                setActiveTab={vault.setActiveTab} 
              />
            )}
          </main>

          <PreviewModal previewDoc={vault.previewDoc} onClose={() => vault.setPreviewDoc(null)} />
        </div>
      </SignedIn>
    </>
  );
}