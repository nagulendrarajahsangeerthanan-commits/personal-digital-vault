import { useState } from 'react';
import './App.css';
import StorageStats from './Components/StorageStats';
import FolderList from './Components/FolderList';
import SearchBar from './Components/SearchBar';
import CredentialVault from './Components/CredentialVault';
import DocumentUpload from './Components/DocumentUpload';
import DocumentList from './Components/DocumentList';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main>
      <header>
        <h1>Personal Digital Vault</h1>
        <p>Secure client-side storage architecture</p>
      </header>

      <StorageStats />

      <SearchBar onSearch={setSearchQuery} />
      
      <FolderList searchQuery={searchQuery} />
      <CredentialVault searchQuery={searchQuery} />
      <DocumentUpload />
      <DocumentList searchQuery={searchQuery} />
    </main>
  );
}