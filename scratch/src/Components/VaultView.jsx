

import  { useState } from 'react';

export default function VaultView({
  documents, folders, addFolder, deleteFolder,
  addDocument, deleteDocument, renameDocument,
  handleDownload, setPreviewDoc, userPlan
}) {
  const [newFolderName, setNewFolderName] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [newDocFolder, setNewDocFolder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const onFolderSubmit = (e) => {
    e.preventDefault();
    addFolder(newFolderName);
    setNewFolderName('');
  };

  const onDocSubmit = (e) => {
    e.preventDefault();
    addDocument(newDocName, newDocFolder);
    setNewDocName('');
    setNewDocFolder('');
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = (doc?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'all' || doc.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <>
      <section className="section-card">
        <h2>Storage Overview</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-label">Stored Documents</span>
            <strong className="stat-val">{documents.length} Files</strong>
          </div>
          <div className="stat-box">
            <span className="stat-label">Active Folders</span>
            <strong className="stat-val">{folders.length} Folders</strong>
          </div>
          <div className="stat-box">
            <span className="stat-label">Subscription Tier</span>
            <strong className="stat-val tier-badge">{userPlan.toUpperCase()}</strong>
          </div>
        </div>
      </section>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search documents by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
          <option value="all">📁 All Categories</option>
          {folders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <section className="section-card">
        <h2>Category & Folder Management</h2>
        <form onSubmit={onFolderSubmit} className="inline-form">
          <input
            type="text"
            placeholder="Folder name (e.g. Financial, Medical)..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button type="submit" className="btn-primary">Create Folder</button>
        </form>

        <div className="folder-chips">
          {folders.length === 0 ? (
            <p className="empty-text">No folders created yet.</p>
          ) : (
            folders.map((f) => (
              <div key={f.id} className="folder-chip">
                <span>📁 {f.name}</span>
                <button type="button" onClick={() => deleteFolder(f.id)}>✕</button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="section-card">
        <h2>Store & Upload Document</h2>
        <form onSubmit={onDocSubmit} className="inline-form">
          <input
            type="text"
            placeholder="File Name (e.g. NIC_Scan.pdf)..."
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
          />
          <select value={newDocFolder} onChange={(e) => setNewDocFolder(e.target.value)}>
            <option value="">Uncategorized</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Upload Document</button>
        </form>

        <table className="vault-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Size</th>
              <th>Upload Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr><td colSpan="4" className="empty-cell">No documents found.</td></tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>📄 {doc.name}</td>
                  <td>{doc.size}</td>
                  <td>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <button type="button" onClick={() => setPreviewDoc(doc)}>Preview</button>
                      <button type="button" onClick={() => renameDocument(doc)}>Rename</button>
                      <button type="button" onClick={() => handleDownload(doc)}>Download</button>
                      <button type="button" className="btn-del" onClick={() => deleteDocument(doc.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}