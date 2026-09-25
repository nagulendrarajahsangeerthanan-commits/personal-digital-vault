import { useState } from 'react';
import './App.css';
import AuthView from './Components/AuthView';
import StorageStats from './Components/StorageStats';
import SearchBar from './Components/SearchBar';
import FolderList from './Components/FolderList';
import CredentialVault from './Components/CredentialVault';
import DocumentUpload from './Components/DocumentUpload';
import DocumentList from './Components/DocumentList';
import ActivityLogs from './Components/ActivityLogs';

export default function App() {
  const [user, setUser] = useState({ email: 'user@vault.local' }); // Toggle to null to test login screen
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main>
      <header>
        <h1>Personal Digital Vault</h1>
        <p>Secure client-side storage architecture</p>
        {user && (
          <div>
            <small>Active Session: {user.email}</small>
            <button type="button" onClick={() => setUser(null)}>Sign Out</button>
          </div>
        )}
      </header>

      {!user ? (
        <AuthView onLoginSuccess={(u) => setUser(u)} />
      ) : (
        <>
          <StorageStats />
          <SearchBar onSearch={setSearchQuery} />
          <FolderList searchQuery={searchQuery} />
          <CredentialVault searchQuery={searchQuery} />
          <DocumentUpload />
          <DocumentList searchQuery={searchQuery} />
          <ActivityLogs />
        </>
      )}
    </main>
  );
}