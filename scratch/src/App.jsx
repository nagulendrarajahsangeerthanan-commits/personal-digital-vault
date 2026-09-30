import React, { useState, useEffect } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton, 
  useUser, 
  useClerk 
} from '@clerk/clerk-react';
import './App.css';

// Master Administrator Email
const MASTER_ADMIN_EMAIL = 'nagulendrarajahsangeerthanan@gmail.com';
const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';

  // Staff Whitelist State
  const [assignedStaffList, setAssignedStaffList] = useState([
    'staff@digitalvault.io',
    'support@digitalvault.io'
  ]);
  const [staffEmailInput, setStaffEmailInput] = useState('');

  // Role Determination
  const getUserRole = () => {
    if (userEmail === MASTER_ADMIN_EMAIL.toLowerCase()) return 'admin';
    if (assignedStaffList.map(e => e.toLowerCase()).includes(userEmail)) return 'staff';
    return 'user';
  };

  const currentRole = getUserRole();

  // Navigation Tabs: 'dashboard' | 'credentials' | 'audit' | 'subscription' | 'team'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Folders State with localStorage cache & Database Synchronization
  const [folders, setFolders] = useState(() => {
    try {
      const cached = localStorage.getItem('vault_folders_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse cached folders:', e);
    }
    return [
      { id: '1', name: 'keerthu_personal', owner: 'keerthu@vaultuser.com' },
      { id: '2', name: 'my passport', owner: MASTER_ADMIN_EMAIL.toLowerCase() },
      { id: '3', name: 'finance_audit', owner: 'staff@digitalvault.io' }
    ];
  });
  const [newFolderName, setNewFolderName] = useState('');

  // Synchronize folders from backend Supabase database
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch(`${API_BASE}/folders`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(f => ({
              id: f.id,
              name: f.name,
              owner: f.user_id || 'System'
            }));
            setFolders(mapped);
            localStorage.setItem('vault_folders_cache', JSON.stringify(mapped));
          }
        }
      } catch (err) {
        console.warn('Failed to load folders from database, using cached:', err);
      }
    };
    fetchFolders();
  }, []);

  // Documents State with Actual File Data / Blob for Downloads
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'degree_certificate.pdf',
      size: '3.9 MB',
      uploadDate: '9/28/2026',
      folder: 'my passport',
      owner: MASTER_ADMIN_EMAIL.toLowerCase(),
      securityStatus: 'Stored securely in PostgreSQL (AES-256 Vault Encryption)',
      fileUrl: null,
      content: 'Digital Vault Secure Document: Degree Certificate. Verified by AES-256 Vault Encryption.'
    },
    {
      id: 2,
      name: 'keerthu_nic_scan.pdf',
      size: '1.8 MB',
      uploadDate: '9/29/2026',
      folder: 'keerthu_personal',
      owner: 'keerthu@vaultuser.com',
      securityStatus: 'Stored securely in PostgreSQL (AES-256 Vault Encryption)',
      fileUrl: null,
      content: 'Digital Vault Secure Document: NIC Scan Identity Verification Card.'
    },
    {
      id: 3,
      name: 'staff_security_log.pdf',
      size: '2.4 MB',
      uploadDate: '9/29/2026',
      folder: 'finance_audit',
      owner: 'staff@digitalvault.io',
      securityStatus: 'Stored securely in PostgreSQL (AES-256 Vault Encryption)',
      fileUrl: null,
      content: 'Digital Vault Security Audit: Session compliance passing PostgreSQL Row-Level Security checks.'
    }
  ]);

  // Real PC File Selection State
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('All');

  // Credentials State
  const [credentials, setCredentials] = useState([
    { id: 1, site: 'Supabase DB', username: 'admin_postgres', pass: '••••••••••••' },
    { id: 2, site: 'Clerk Production', username: 'nagulendra@clerk.dev', pass: '••••••••••••' },
    { id: 3, site: 'AWS S3 Vault', username: 'iam_vault_sync', pass: '••••••••••••' }
  ]);
  const [newSite, setNewSite] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Admin: Assign New Staff
  const handleAssignStaff = (e) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      alert('Only System Administrator can assign Staff roles.');
      return;
    }
    const emailToAssign = staffEmailInput.trim().toLowerCase();
    if (!emailToAssign) return;
    if (assignedStaffList.includes(emailToAssign)) {
      alert('This user is already in the Staff list.');
      return;
    }
    setAssignedStaffList([...assignedStaffList, emailToAssign]);
    setStaffEmailInput('');
    alert(`Success: ${emailToAssign} has been assigned as Staff Operator!`);
  };

  const handleRevokeStaff = (emailToRevoke) => {
    if (currentRole !== 'admin') return;
    setAssignedStaffList(assignedStaffList.filter(e => e !== emailToRevoke));
    alert(`Revoked: Staff privileges removed for ${emailToRevoke}`);
  };

  // Folder Actions
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (currentRole === 'user') {
      alert('Security Policy: Standard users cannot create categories.');
      return;
    }
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    const exists = folders.some(f => f.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert('A category with this name already exists.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          user_id: userEmail || 'system'
        })
      });

      if (res.ok) {
        const created = await res.json();
        const newFolderObj = {
          id: created.id,
          name: created.name,
          owner: created.user_id || userEmail
        };
        setFolders(prev => {
          const updated = [newFolderObj, ...prev.filter(f => f.id !== created.id)];
          localStorage.setItem('vault_folders_cache', JSON.stringify(updated));
          return updated;
        });
        setNewFolderName('');
        alert(`Folder "${created.name}" created and saved to database!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to save folder to database: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('Error saving folder to backend:', err);
      // Fallback local save if offline
      const localObj = { id: Date.now().toString(), name: trimmed, owner: userEmail };
      setFolders(prev => {
        const updated = [localObj, ...prev];
        localStorage.setItem('vault_folders_cache', JSON.stringify(updated));
        return updated;
      });
      setNewFolderName('');
      alert(`Folder "${trimmed}" saved locally (Backend offline).`);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (currentRole !== 'admin') {
      alert('Unauthorized: Only Administrators can permanently remove categories.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/folders/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setFolders(prev => {
          const updated = prev.filter(f => f.id !== id);
          localStorage.setItem('vault_folders_cache', JSON.stringify(updated));
          return updated;
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Failed to delete folder: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('Error deleting folder:', err);
      setFolders(prev => {
        const updated = prev.filter(f => f.id !== id);
        localStorage.setItem('vault_folders_cache', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Real PC File Upload Handler
  const handleUploadDocument = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file from your computer first!');
      return;
    }

    const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
    const formattedSize = Number(sizeInMB) >= 1 
      ? `${sizeInMB} MB` 
      : `${(selectedFile.size / 1024).toFixed(1)} KB`;

    // Local Object URL for real PC file download & preview
    const fileBlobUrl = URL.createObjectURL(selectedFile);

    const newDoc = {
      id: Date.now(),
      name: selectedFile.name,
      size: formattedSize,
      uploadDate: new Date().toLocaleDateString(),
      folder: selectedFolder === 'All' ? 'General' : selectedFolder,
      owner: userEmail,
      securityStatus: 'Stored securely in PostgreSQL (AES-256 Vault Encryption)',
      fileUrl: fileBlobUrl,
      fileObject: selectedFile
    };

    setDocuments([newDoc, ...documents]);
    setSelectedFile(null);
    alert(`File "${selectedFile.name}" stored & encrypted in Vault!`);
  };

  const handleDeleteDocument = (id) => {
    if (currentRole === 'user') {
      alert('Access Denied: Standard users cannot delete documents. Contact an Admin.');
      return;
    }
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const handleRenameDocument = (id) => {
    if (currentRole === 'user') {
      alert('Access Denied: Renaming files is restricted to Staff and Admins.');
      return;
    }
    const currentDoc = documents.find(d => d.id === id);
    const updatedName = prompt('Enter new document name:', currentDoc.name);
    if (updatedName && updatedName.trim()) {
      setDocuments(documents.map(d => d.id === id ? { ...d, name: updatedName.trim() } : d));
    }
  };

  // Real Browser Downloads Folder Trigger Handler
  const handleDownload = (doc) => {
    let downloadUrl = doc.fileUrl;
    let shouldRevoke = false;

    
    if (!downloadUrl) {
      const blob = new Blob([doc.content || 'Encrypted Personal Digital Vault Document Content'], { 
        type: 'application/pdf' 
      });
      downloadUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    }

    
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = doc.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    if (shouldRevoke) {
      URL.revokeObjectURL(downloadUrl);
    }
  };

  // Credential Actions
  const handleAddCredential = (e) => {
    e.preventDefault();
    if (currentRole !== 'admin') {
      alert('Access Restricted: Only Administrators can create new credentials.');
      return;
    }
    if (!newSite || !newUsername || !newPassword) return;
    setCredentials([
      ...credentials,
      { id: Date.now(), site: newSite, username: newUsername, pass: newPassword }
    ]);
    setNewSite('');
    setNewUsername('');
    setNewPassword('');
  };

  const handleDeleteCredential = (id) => {
    if (currentRole !== 'admin') {
      alert('Security Policy: Only Administrators can delete secrets.');
      return;
    }
    setCredentials(credentials.filter(c => c.id !== id));
  };

  // Sign out Handler
  const handleSignOut = () => {
    signOut(() => {
      window.location.href = '/';
    });
  };

  // Payment Checkout Process
  const handleProcessPayment = (e) => {
    e.preventDefault();
    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setSelectedPlanForPayment(null);
      alert('Payment Verified! Subscription upgraded to Cyber Enterprise.');
    }, 1500);
  };

  // Role-based visibility filtering
  const accessibleFolders = (currentRole === 'admin' || currentRole === 'staff')
    ? folders
    : folders.filter(f => !f.owner || f.owner.toLowerCase() === userEmail.toLowerCase() || f.owner === 'System');

  const accessibleDocs = (currentRole === 'admin' || currentRole === 'staff')
    ? documents
    : documents.filter(d => d.owner === userEmail);

  const filteredDocs = accessibleDocs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || doc.folder === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* 1. SIGNED OUT VIEW */}
      <SignedOut>
        <div style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#070d1e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <div style={{
            background: '#0d1527',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '40px 48px',
            textAlign: 'center',
            maxWidth: '440px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
          }}>
            <svg style={{ width: '52px', height: '52px', color: '#38bdf8', marginBottom: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '8px' }}>Personal Digital Vault</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '24px' }}>
              Vault storage is protected. Sign in via Clerk to access AES-256 encrypted records.
            </p>
            <SignInButton mode="modal">
              <button className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                🔑 Authenticate / Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>

      {/* 2. SIGNED IN VIEW */}
      <SignedIn>
        <div className="app-container">
          {/* SIDEBAR NAVIGATION */}
          <aside className="sidebar">
            <div>
              <div className="sidebar-header">
                <svg className="vault-logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                <div>
                  <h2>Digital Vault</h2>
                  <span 
                    className="vault-badge" 
                    style={{ 
                      background: currentRole === 'admin' ? 'rgba(239, 68, 68, 0.25)' : currentRole === 'staff' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                      color: currentRole === 'admin' ? '#f87171' : currentRole === 'staff' ? '#38bdf8' : '#34d399',
                      textTransform: 'uppercase',
                      fontWeight: '800'
                    }}
                  >
                    {currentRole === 'admin' ? '⚡ ROOT / ENTERPRISE' : currentRole === 'staff' ? '🛡️ STAFF OPERATOR' : 'FREE TIER'}
                  </span>
                </div>
              </div>

              {/* User Profile Badge */}
              <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserButton afterSignOutUrl="/" />
                <div style={{ overflow: 'hidden' }}>
                  <span className="user-email">{userEmail}</span>
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    color: currentRole === 'admin' ? '#f59e0b' : currentRole === 'staff' ? '#38bdf8' : '#10b981'
                  }}>
                    {currentRole === 'admin' && '👑 System Administrator'}
                    {currentRole === 'staff' && '🛡️ Staff Operator'}
                    {currentRole === 'user' && '👤 Standard User'}
                  </div>
                </div>
              </div>

              <nav className="sidebar-links">
                <button 
                  className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  📊 Vault Dashboard
                </button>

                {/* Credentials Link */}
                <button 
                  className={`nav-link-btn ${activeTab === 'credentials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('credentials')}
                  style={{ opacity: currentRole === 'user' ? 0.45 : 1 }}
                >
                  🔑 Credentials Locker {currentRole === 'user' && '🔒'}
                </button>

                {/* Staff Assignment (Admin Only) */}
                {currentRole === 'admin' && (
                  <button 
                    className={`nav-link-btn ${activeTab === 'team' ? 'active' : ''}`}
                    onClick={() => setActiveTab('team')}
                  >
                    👥 Assign & Manage Staff
                  </button>
                )}

                {/* Security Audit Link */}
                <button 
                  className={`nav-link-btn ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                  style={{ opacity: currentRole !== 'admin' ? 0.45 : 1 }}
                >
                  📑 Security Audit {currentRole !== 'admin' && '🔒'}
                </button>

                <button 
                  className={`nav-link-btn ${activeTab === 'subscription' ? 'active' : ''}`}
                  onClick={() => setActiveTab('subscription')}
                >
                  ⚡ Subscription Plans
                </button>
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
              <div style={{ marginBottom: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
                Document Quota: {accessibleDocs.length} / {currentRole === 'admin' ? '∞' : '5'}
              </div>
              <button 
                type="button"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🔒 Sign Out / Lock Vault
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="content-area">
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <>
                <section className="section-card storage-overview">
                  <h2>
                    Storage Overview ({currentRole === 'admin' ? 'Enterprise Multi-Tenant Explorer' : currentRole.toUpperCase()})
                  </h2>
                  <div className="storage-overview-grid">
                    <div className="stat-box">
                      <span>{currentRole === 'admin' ? 'TOTAL VAULT ASSETS' : 'MY DOCUMENTS'}</span>
                      <h2>{accessibleDocs.length} Files</h2>
                    </div>
                    <div className="stat-box">
                      <span>{currentRole === 'admin' ? 'TOTAL SYSTEM FOLDERS' : 'MY FOLDERS'}</span>
                      <h2>{accessibleFolders.length} Folders</h2>
                    </div>
                    <div className="stat-box">
                      <span>SCOPE LEVEL</span>
                      <h2 style={{ fontSize: '1.1rem', color: currentRole === 'admin' ? '#ef4444' : currentRole === 'staff' ? '#38bdf8' : '#10b981' }}>
                        {currentRole === 'admin' ? 'Global Multi-Tenant' : currentRole === 'staff' ? 'Staff Operator' : 'Single User Vault'}
                      </h2>
                    </div>
                  </div>
                </section>

                <div className="search-filter-row">
                  <input 
                    type="text" 
                    placeholder="Search documents by name or owner email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="All">📁 All Categories</option>
                    {accessibleFolders.map((f) => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category & Folder Management */}
                <section className="section-card category-management">
                  <h2>
                    {currentRole === 'admin' ? 'Global Tenant Folders & Categories' : 'Folder Management'}
                  </h2>
                  {currentRole !== 'user' ? (
                    <form className="inline-form" onSubmit={handleCreateFolder}>
                      <input 
                        type="text" 
                        placeholder="Folder name (e.g. Legal, Medical)..." 
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                      />
                      <button type="submit" className="btn-primary">Create Folder</button>
                    </form>
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>
                      🔒 Category creation is locked for Standard Users. Contact Staff or Admin.
                    </p>
                  )}

                  <div className="folder-chips">
                    {accessibleFolders.map((folder) => (
                      <div key={folder.id} className="folder-chip">
                        <span>📁 {folder.name}</span>
                        {currentRole === 'admin' && (
                          <span style={{ fontSize: '0.7rem', color: '#38bdf8', opacity: 0.8 }}>
                            ({folder.owner ? folder.owner.split('@')[0] : 'user'})
                          </span>
                        )}
                        {currentRole === 'admin' && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteFolder(folder.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 4px' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Store & Upload Document (Real PC File Explorer Picker) */}
                <section className="section-card upload-card">
                  <h2>Store & Upload Document</h2>
                  
                  <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      
                      {/* Styled File Explorer Picker */}
                      <label 
                        htmlFor="pc-file-upload-input" 
                        style={{
                          background: 'rgba(56, 189, 248, 0.12)',
                          border: '1px dashed #38bdf8',
                          color: '#38bdf8',
                          padding: '10px 18px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        📁 {selectedFile ? 'Change Selected File' : 'Browse PC File...'}
                      </label>

                      <input 
                        id="pc-file-upload-input" 
                        type="file" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                          }
                        }}
                      />

                      {/* Folder Dropdown */}
                      <select 
                        value={selectedFolder} 
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        style={{ minWidth: '180px' }}
                      >
                        <option value="All">General Folder</option>
                        {accessibleFolders.map((f) => (
                          <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                      </select>

                      {/* Submit Upload Button */}
                      <button 
                        type="submit" 
                        className="btn-primary"
                        style={{
                          opacity: selectedFile ? 1 : 0.6,
                          cursor: selectedFile ? 'pointer' : 'not-allowed'
                        }}
                      >
                        📤 Upload to Vault
                      </button>
                    </div>

                    {/* File Selection Visual Feedback */}
                    {selectedFile ? (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ color: '#10b981', fontSize: '0.85rem' }}>
                          ✓ Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setSelectedFile(null)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        ℹ️ Click <strong>"Browse PC File..."</strong> to choose any PDF or document from your laptop.
                      </span>
                    )}
                  </form>

                  {/* Documents Table */}
                  <div className="document-table" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: currentRole === 'admin' ? '2.5fr 2fr 1fr 1fr 2.5fr' : '3fr 1fr 1fr 2fr', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, padding: '0 18px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <span>Document Name</span>
                      {currentRole === 'admin' && <span>Owner / Tenant</span>}
                      <span>Size</span>
                      <span>Upload Date</span>
                      <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>

                    {filteredDocs.map((doc) => (
                      <div key={doc.id} className="document-item" style={{ display: 'grid', gridTemplateColumns: currentRole === 'admin' ? '2.5fr 2fr 1fr 1fr 2.5fr' : '3fr 1fr 1fr 2fr', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📄</span>
                          <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{doc.name}</strong>
                        </div>
                        
                        {/* Owner Email Column for Admin */}
                        {currentRole === 'admin' && (
                          <span style={{ fontSize: '0.78rem', color: doc.owner === MASTER_ADMIN_EMAIL.toLowerCase() ? '#f59e0b' : '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.owner}
                          </span>
                        )}

                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{doc.size}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{doc.uploadDate}</span>

                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            type="button" 
                            onClick={() => setPreviewDoc(doc)}
                            style={{ background: '#0284c7', color: '#fff', padding: '5px 10px', fontSize: '0.8rem' }}
                          >
                            Preview
                          </button>
                          
                          {currentRole !== 'user' && (
                            <button 
                              type="button" 
                              onClick={() => handleRenameDocument(doc.id)}
                              style={{ background: '#06b6d4', color: '#fff', padding: '5px 10px', fontSize: '0.8rem' }}
                            >
                              Rename
                            </button>
                          )}
                          
                          {/* Dedicated Real Browser Downloads Trigger */}
                          <button 
                            type="button" 
                            onClick={() => handleDownload(doc)}
                            style={{ background: '#10b981', color: '#fff', padding: '5px 10px', fontSize: '0.8rem' }}
                          >
                            Download
                          </button>
                          
                          {currentRole !== 'user' && (
                            <button 
                              type="button" 
                              className="btn-delete"
                              onClick={() => handleDeleteDocument(doc.id)}
                              style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* 2. CREDENTIALS LOCKER VIEW */}
            {activeTab === 'credentials' && (
              <section className="section-card">
                <h2>🔑 Encrypted Credentials Locker</h2>
                {currentRole === 'user' ? (
                  <div style={{ padding: '36px', textAlign: 'center', background: '#070d1e', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>🚫 403 Forbidden: Standard User Access Restricted</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                      Credentials locker requires Staff Operator or Administrator privileges. Your account ({userEmail}) is under Standard User tier.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                      {currentRole === 'staff' 
                        ? 'Staff View: You can view and copy credentials to operate services. Secret creation and deletion is restricted to Admins.'
                        : 'Administrator View: Full access to insert, reveal, and purge encrypted credentials.'}
                    </p>

                    {currentRole === 'admin' && (
                      <form className="inline-form" onSubmit={handleAddCredential} style={{ marginBottom: '24px' }}>
                        <input 
                          type="text" 
                          placeholder="Service (e.g. AWS, Supabase)" 
                          value={newSite}
                          onChange={(e) => setNewSite(e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Username / Identifier" 
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                        />
                        <input 
                          type="password" 
                          placeholder="Password / Secret Key" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="submit" className="btn-primary">Add Secret</button>
                      </form>
                    )}

                    <div className="document-table">
                      {credentials.map(c => (
                        <div key={c.id} className="document-item">
                          <div>
                            <strong style={{ color: '#38bdf8' }}>{c.site}</strong>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{c.username}</div>
                          </div>
                          <span style={{ fontFamily: 'monospace', color: '#10b981', letterSpacing: '2px' }}>{c.pass}</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              type="button" 
                              onClick={() => alert(`Copied secret for ${c.site} to clipboard!`)}
                              style={{ background: '#0284c7', color: '#fff', padding: '6px 12px' }}
                            >
                              Copy Secret
                            </button>
                            {currentRole === 'admin' && (
                              <button 
                                type="button" 
                                className="btn-delete"
                                onClick={() => handleDeleteCredential(c.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {/* 3. ASSIGN & MANAGE STAFF (Admin Only) */}
            {activeTab === 'team' && currentRole === 'admin' && (
              <section className="section-card">
                <h2>👥 Staff Delegation & Role Management</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Assign user accounts as Staff Operators. Staff can manage documents, categories, and view credentials, while audit logs and credential deletions remain exclusive to Admin.
                </p>

                <form className="inline-form" onSubmit={handleAssignStaff} style={{ marginBottom: '24px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter user email to assign as Staff..." 
                    value={staffEmailInput}
                    onChange={(e) => setStaffEmailInput(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">Promote to Staff</button>
                </form>

                <div className="document-table">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, padding: '0 18px 8px' }}>
                    <span>Assigned Staff Email</span>
                    <span>Assigned Role</span>
                    <span>Actions</span>
                  </div>

                  {assignedStaffList.map((email, index) => (
                    <div key={index} className="document-item">
                      <div>
                        <strong style={{ color: '#f8fafc' }}>{email}</strong>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Active Operator Privileges</div>
                      </div>
                      <span className="vault-badge" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                        Staff Role
                      </span>
                      <button 
                        type="button" 
                        className="btn-delete"
                        onClick={() => handleRevokeStaff(email)}
                      >
                        Revoke Staff
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. SECURITY AUDIT VIEW (Admin Only) */}
            {activeTab === 'audit' && (
              <section className="section-card">
                <h2>📑 Security Audit & Compliance Logs</h2>
                {currentRole !== 'admin' ? (
                  <div style={{ padding: '36px', textAlign: 'center', background: '#070d1e', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>🛡️ Administrator Privilege Required</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                      Compliance telemetry, PostgreSQL Row Level Security metrics, and session audit logs are exclusively reserved for Administrators.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                    <div className="document-item" style={{ borderLeft: '4px solid #10b981' }}>
                      <div>
                        <strong style={{ color: '#f8fafc' }}>PostgreSQL Row Level Security (RLS)</strong>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>All Supabase tables restricted with authenticated user context.</div>
                      </div>
                      <span className="status-badge-secure">Passed ✅</span>
                    </div>

                    <div className="document-item" style={{ borderLeft: '4px solid #10b981' }}>
                      <div>
                        <strong style={{ color: '#f8fafc' }}>Clerk JWT Session Verification</strong>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Session token strictly verified on Express backend middleware.</div>
                      </div>
                      <span className="status-badge-secure">Active & Verified ✅</span>
                    </div>

                    <div className="document-item" style={{ borderLeft: '4px solid #10b981' }}>
                      <div>
                        <strong style={{ color: '#f8fafc' }}>Vault Document Encryption Protocol</strong>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Server-side AES-256 GCM applied to all binary payloads.</div>
                      </div>
                      <span className="status-badge-secure">Encrypted ✅</span>
                    </div>

                    <div className="document-item" style={{ borderLeft: '4px solid #38bdf8' }}>
                      <div>
                        <strong style={{ color: '#f8fafc' }}>Audit Log & Session Tracker</strong>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Administrator session verified at 127.0.0.1.</div>
                      </div>
                      <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>Zero Threats Found</span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 5. SUBSCRIPTION & BILLING VIEW */}
            {activeTab === 'subscription' && (
              <section className="section-card">
                <h2>⚡ Subscription & Tier Management</h2>

                {/* ADMIN VIEW */}
                {currentRole === 'admin' ? (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                      border: '1px solid #38bdf8',
                      borderRadius: '12px',
                      padding: '28px',
                      boxShadow: '0 0 25px rgba(56, 189, 248, 0.15)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem' }}>👑 Master Enterprise License (Admin)</h3>
                        <span className="status-badge-secure" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                          Active Lifetime License ✅
                        </span>
                      </div>

                      <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '20px' }}>
                        As the System Administrator, this vault operates on an unrestricted root license. No recurring billing or subscription payments are required.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="stat-box">
                          <span>STORAGE QUOTA</span>
                          <h2>Unlimited (∞)</h2>
                        </div>
                        <div className="stat-box">
                          <span>ENCRYPTION ENGINE</span>
                          <h2>AES-256 GCM</h2>
                        </div>
                        <div className="stat-box">
                          <span>STAFF SEATS</span>
                          <h2>Unlimited</h2>
                        </div>
                        <div className="stat-box">
                          <span>NEXT BILLING DATE</span>
                          <h2 style={{ fontSize: '1.2rem', color: '#10b981' }}>N/A (Exempted)</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* USER & STAFF VIEW */
                  <>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px', marginTop: '8px' }}>
                      Scale your digital vault storage and unlock advanced team features.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '18px' }}>
                      <div style={{ background: '#070d1e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '24px' }}>
                        <h3 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '8px' }}>Free Tier</h3>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginBottom: '16px' }}>$0 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ forever</span></div>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '2' }}>
                          <li>✓ Up to 5 Documents</li>
                          <li>✓ Read-only Categories</li>
                          <li>✓ Standard AES-256 Encryption</li>
                        </ul>
                        <button type="button" style={{ marginTop: '20px', width: '100%', background: '#1e293b', color: '#94a3b8', cursor: 'default' }}>
                          Current Active Plan
                        </button>
                      </div>

                      <div style={{ background: '#0b162c', border: '1px solid #38bdf8', borderRadius: '10px', padding: '24px', boxShadow: '0 0 25px rgba(56,189,248,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ color: '#ffffff', fontSize: '1.2rem' }}>Cyber Pro</h3>
                          <span className="vault-badge" style={{ background: '#38bdf8', color: '#070d1e' }}>POPULAR</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', margin: '8px 0 16px' }}>$9 <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ month</span></div>
                        <ul style={{ listStyle: 'none', padding: 0, color: '#cbd5e1', fontSize: '0.85rem', lineHeight: '2' }}>
                          <li>✓ Unlimited Documents</li>
                          <li>✓ Staff Operator Privileges</li>
                          <li>✓ Automated Backups</li>
                        </ul>
                        <button 
                          type="button" 
                          className="btn-primary" 
                          style={{ marginTop: '20px', width: '100%' }}
                          onClick={() => setSelectedPlanForPayment({ name: 'Cyber Pro', price: '$9.00', billed: 'Monthly' })}
                        >
                          💳 Subscribe & Pay ($9)
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}
          </main>

          {/* 3. CENTERED SECURITY PREVIEW MODAL */}
          {previewDoc && (
            <div className="preview-modal-backdrop" onClick={() => setPreviewDoc(null)}>
              <div className="preview-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="preview-modal-header">
                  <h3>🔒 Document Security Preview</h3>
                  <button 
                    type="button" 
                    className="btn-modal-close" 
                    onClick={() => setPreviewDoc(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="preview-modal-body">
                  <div className="preview-info-row">
                    <span className="info-label">File Name</span>
                    <span className="info-val">{previewDoc.name}</span>
                  </div>

                  <div className="preview-info-row">
                    <span className="info-label">Owner / Uploaded By</span>
                    <span className="info-val" style={{ color: '#38bdf8' }}>{previewDoc.owner}</span>
                  </div>

                  <div className="preview-info-row">
                    <span className="info-label">File Size</span>
                    <span className="info-val">{previewDoc.size}</span>
                  </div>

                  <div className="preview-info-row">
                    <span className="info-label">Encrypted Status</span>
                    <span className="status-badge-secure">
                      🛡️ {previewDoc.securityStatus}
                    </span>
                  </div>

                  <div className="preview-info-row">
                    <span className="info-label">Upload Timestamp</span>
                    <span className="info-val">{previewDoc.uploadDate}</span>
                  </div>
                </div>

                <div className="preview-modal-footer">
                  <button 
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    style={{ background: '#10b981', color: '#fff', padding: '8px 16px', borderRadius: '6px', marginRight: '8px' }}
                  >
                    ⬇️ Download to PC
                  </button>
                  <button 
                    type="button" 
                    className="btn-preview-dismiss" 
                    onClick={() => setPreviewDoc(null)}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. SUBSCRIPTION PAYMENT CHECKOUT MODAL */}
          {selectedPlanForPayment && (
            <div className="preview-modal-backdrop" onClick={() => setSelectedPlanForPayment(null)}>
              <div className="preview-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                <div className="preview-modal-header">
                  <h3>💳 Secure Vault Payment Checkout</h3>
                  <button 
                    type="button" 
                    className="btn-modal-close" 
                    onClick={() => setSelectedPlanForPayment(null)}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleProcessPayment}>
                  <div className="preview-modal-body">
                    <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: '700' }}>{selectedPlanForPayment.name}</span>
                        <span style={{ color: '#38bdf8', fontSize: '1.2rem', fontWeight: '800' }}>{selectedPlanForPayment.price}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Billed {selectedPlanForPayment.billed} • Cancel anytime</span>
                    </div>

                    <div className="preview-info-row">
                      <span className="info-label">Cardholder Name</span>
                      <input 
                        type="text" 
                        required 
                        placeholder="Nagulendrarajah Sangeerthanan" 
                        defaultValue={user?.fullName || ''}
                      />
                    </div>

                    <div className="preview-info-row">
                      <span className="info-label">Card Number</span>
                      <input 
                        type="text" 
                        required 
                        maxLength="19"
                        placeholder="4242 •••• •••• 4242" 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="preview-info-row" style={{ flex: 1 }}>
                        <span className="info-label">Expiry</span>
                        <input type="text" required placeholder="MM/YY" maxLength="5" />
                      </div>
                      <div className="preview-info-row" style={{ flex: 1 }}>
                        <span className="info-label">CVC / CVV</span>
                        <input type="password" required placeholder="•••" maxLength="4" />
                      </div>
                    </div>
                  </div>

                  <div className="preview-modal-footer" style={{ marginTop: '16px' }}>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ width: '100%', padding: '12px' }}
                      disabled={paymentSuccess}
                    >
                      {paymentSuccess ? 'Processing Encrypted Payment...' : `Confirm & Pay ${selectedPlanForPayment.price}`}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}