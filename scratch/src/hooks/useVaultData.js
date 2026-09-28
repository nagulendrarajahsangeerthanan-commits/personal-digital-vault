import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';
export const FREE_DOC_LIMIT = 5;

export function useVaultData(user) {
  const [activeTab, setActiveTab] = useState('vault');
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [userPlan, setUserPlan] = useState('free');

  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const isAdmin = userEmail.includes('admin') || userEmail.startsWith('nagulendrarajah');

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    let isCancelled = false;

    async function syncVault() {
      if (!user) return;
      setLoading(true);

      const safeFetch = async (endpoint) => {
        try {
          const res = await fetch(`${API_BASE}${endpoint}`);
          if (!res.ok) return [];
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        } catch (err) {
          console.warn(`Failed to fetch ${endpoint}:`, err);
          return [];
        }
      };

      try {
        const [fData, dData, cData, lData] = await Promise.all([
          safeFetch('/folders'),
          safeFetch('/documents'),
          safeFetch('/credentials'),
          safeFetch('/logs')
        ]);

        if (!isCancelled) {
          setFolders(Array.isArray(fData) ? fData : []);
          setDocuments(Array.isArray(dData) ? dData : []);
          setCredentials(
            Array.isArray(cData)
              ? cData.map((item) => ({ ...item, visible: false }))
              : []
          );
          setActivityLogs(Array.isArray(lData) ? lData : []);
        }
      } catch (err) {
        console.error("Vault sync error:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    syncVault();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  const addFolder = async (name) => {
    if (!name || !name.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), user_id: user?.id })
      });
      if (res.ok) {
        const created = await res.json();
        setFolders((prev) => [created, ...prev]);
        showNotice(`Folder "${name.trim()}" created!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFolder = async (id) => {
    try {
      await fetch(`${API_BASE}/folders/${id}`, { method: 'DELETE' });
      setFolders((prev) => prev.filter((f) => f.id !== id));
      showNotice('Folder deleted');
    } catch (err) {
      console.error(err);
    }
  };

  const addDocument = async (name, folderId) => {
    if (!name || !name.trim()) return;

    if (userPlan === 'free' && documents.length >= FREE_DOC_LIMIT) {
      showNotice('Free limit reached! Upgrade to Pro for unlimited uploads.');
      setActiveTab('upgrade');
      return;
    }

    const randomSize = `${(Math.random() * 4 + 0.5).toFixed(1)} MB`;

    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          size: randomSize,
          folder_id: folderId || null,
          user_id: user?.id
        })
      });

      if (res.ok) {
        const created = await res.json();
        setDocuments((prev) => [created, ...prev]);
        showNotice('Document uploaded securely!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDocument = async (id) => {
    try {
      await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showNotice('Document deleted');
    } catch (err) {
      console.error(err);
    }
  };

  const renameDocument = (doc) => {
    const updated = window.prompt("New document name:", doc.name);
    if (!updated || updated.trim() === doc.name) return;
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, name: updated.trim() } : d))
    );
    showNotice(`Document renamed to ${updated.trim()}`);
  };

  const handleDownload = (doc) => {
    const element = document.createElement("a");
    const file = new Blob([`Vault encrypted payload: ${doc.name}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.name.endsWith('.pdf') || doc.name.endsWith('.txt') ? doc.name : `${doc.name}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showNotice(`Downloaded ${doc.name}`);
  };

  const addCredential = async (label, secret) => {
    if (!label.trim() || !secret.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          secret: secret.trim(),
          user_id: user?.id
        })
      });

      if (res.ok) {
        const created = await res.json();
        setCredentials((prev) => [{ ...created, visible: false }, ...prev]);
        showNotice('Credential secured in vault!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCredentialVisibility = (id) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const copyCredentialSecret = (secret, label) => {
    navigator.clipboard.writeText(secret);
    showNotice(`Copied secret for ${label}!`);
  };

  return {
    activeTab,
    setActiveTab,
    folders,
    documents,
    credentials,
    activityLogs,
    previewDoc,
    setPreviewDoc,
    loading,
    notification,
    userPlan,
    setUserPlan,
    userEmail,
    isAdmin,
    showNotice,
    addFolder,
    deleteFolder,
    addDocument,
    deleteDocument,
    renameDocument,
    handleDownload,
    addCredential,
    toggleCredentialVisibility,
    copyCredentialSecret
  };
}