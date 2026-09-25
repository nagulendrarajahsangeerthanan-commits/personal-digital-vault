import FolderList from './Components/FolderList';
import CredentialVault from './Components/CredentialVault';
import DocumentUpload from './Components/DocumentUpload';
import DocumentList from './Components/DocumentList';
import './App.css'

export default function App() {
  return (
    <div>
      <h1>Personal Digital Vault</h1>
      <p>Secure client-side storage architecture</p>
      <hr />
      
      <FolderList />

      <hr />

      <CredentialVault />

      <hr />

      <DocumentUpload />

      <hr />

      <DocumentList />
    </div>
  );
}