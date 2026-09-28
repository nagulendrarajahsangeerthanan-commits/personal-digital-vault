import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { vaultService } from './services/vaultService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email']
}));

app.use(express.json());

// Admin-Only Authorization Middleware
const requireAdmin = (req, res, next) => {
  const userEmail = req.headers['x-user-email'] || '';
  const isAdmin = userEmail.includes('admin') || userEmail.startsWith('nagulendrarajah');
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access Denied: Admin clearance required.' });
  }
  next();
};

// Root Health & Discovery
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    architecture: 'Layered Service Model',
    endpoints: ['/api/health', '/api/vault/stats', '/api/folders', '/api/documents', '/api/credentials', '/api/logs']
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'online', service: 'active' }));

// Stats Route
app.get('/api/vault/stats', async (req, res) => {
  try {
    const stats = await vaultService.getVaultStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Folders Routes
app.get('/api/folders', async (req, res) => {
  try {
    const folders = await vaultService.getAllFolders();
    res.json(folders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/folders', async (req, res) => {
  try {
    const { name, user_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });
    const folder = await vaultService.createFolder(name, user_id);
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/folders/:id', async (req, res) => {
  try {
    await vaultService.deleteFolder(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Documents Routes (Quota Protected)
app.get('/api/documents', async (req, res) => {
  try {
    const docs = await vaultService.getAllDocuments();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const { name, size, folder_id, user_id, plan_tier } = req.body;
    if (!name || !size) return res.status(400).json({ error: 'Name and size are required' });
    
    const doc = await vaultService.uploadDocument({ name, size, folder_id, user_id, plan_tier });
    res.status(201).json(doc);
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    await vaultService.deleteDocument(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Credentials Routes
app.get('/api/credentials', async (req, res) => {
  try {
    const creds = await vaultService.getAllCredentials();
    res.json(creds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/credentials', async (req, res) => {
  try {
    const { label, secret, user_id } = req.body;
    if (!label || !secret) return res.status(400).json({ error: 'Label and secret are required' });
    const cred = await vaultService.saveCredential(label, secret, user_id);
    res.status(201).json(cred);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/logs', requireAdmin, async (req, res) => {
  try {
    const logs = await vaultService.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Vault Backend running in Service Layer Architecture on http://localhost:${PORT}`);
});