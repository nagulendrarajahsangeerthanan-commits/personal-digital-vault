import { useState } from 'react';
import './App.css';
<<<<<<< HEAD
import AuthView from './Components/AuthView';
import StorageStats from './Components/StorageStats';
import SearchBar from './Components/SearchBar';
=======
import StorageStats from './Components/StorageStats';
>>>>>>> origin/main
import FolderList from './Components/FolderList';
import SearchBar from './Components/SearchBar';
import CredentialVault from './Components/CredentialVault';
import DocumentUpload from './Components/DocumentUpload';
import DocumentList from './Components/DocumentList';
<<<<<<< HEAD
import ActivityLogs from './Components/ActivityLogs';

export default function App() {
  const [user, setUser] = useState({ email: 'user@vault.local' });
  const [activeTab, setActiveTab] = useState('dashboard');
=======

export default function App() {
>>>>>>> origin/main
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main>
      <header>
        <h1>Personal Digital Vault</h1>
        <p>Secure client-side storage architecture</p>
<<<<<<< HEAD
        
        {user && (
          <nav>
            <button 
              type="button" 
              onClick={() => setActiveTab('dashboard')}
            >
              Vault Dashboard
            </button>

            <button 
              type="button" 
              onClick={() => setActiveTab('logs')}
            >
              Security Audit Logs
            </button>

            <button type="button" onClick={() => setUser(null)}>
              Sign Out
            </button>
          </nav>
        )}
      </header>

      {!user ? (
        <AuthView onLoginSuccess={(u) => setUser(u)} />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <>
              <StorageStats />
              <SearchBar onSearch={setSearchQuery} />
              <FolderList searchQuery={searchQuery} />
              <CredentialVault searchQuery={searchQuery} />
              <DocumentUpload />
              <DocumentList searchQuery={searchQuery} />
            </>
          )}

          {activeTab === 'logs' && (
            <ActivityLogs />
          )}
        </>
      )}
=======
      </header>

      <StorageStats />

      <SearchBar onSearch={setSearchQuery} />
      
      <FolderList searchQuery={searchQuery} />
      <CredentialVault searchQuery={searchQuery} />
      <DocumentUpload />
      <DocumentList searchQuery={searchQuery} />
>>>>>>> origin/main
    </main>
  );
}