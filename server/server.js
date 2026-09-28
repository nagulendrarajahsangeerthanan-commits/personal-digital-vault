import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️ Supabase credentials missing in server/.env');
}

// Root Route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Personal Digital Vault API Server is running securely!',
    endpoints: [
      '/api/health',
      '/api/vault/stats',
      '/api/folders',
      '/api/documents',
      '/api/credentials',
      '/api/logs'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', message: 'Vault Backend healthy' });
});

// Vault Stats
app.get('/api/vault/stats', async (req, res) => {
  if (!supabase) return res.json({ documentsCount: 0, foldersCount: 0, credentialsCount: 0 });
  try {
    const [docsRes, foldersRes, credsRes] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('folders').select('*', { count: 'exact', head: true }),
      supabase.from('credentials').select('*', { count: 'exact', head: true })
    ]);
    res.json({
      documentsCount: docsRes.count || 0,
      foldersCount: foldersRes.count || 0,
      credentialsCount: credsRes.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Folders
app.get('/api/folders', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from('folders').select('*').order('created_at', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch {
    res.json([]);
  }
});

app.post('/api/folders', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { name, user_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const { data, error } = await supabase.from('folders').insert([{ name, user_id }]).select();
    if (error) return res.status(500).json({ error: error.message });

    await supabase.from('audit_logs').insert([{ action: 'Folder Created', target: name, user_id }]);
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/folders/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    const { data: folder } = await supabase.from('folders').select('name').eq('id', id).single();
    const { error } = await supabase.from('folders').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    if (folder) {
      await supabase.from('audit_logs').insert([{ action: 'Folder Deleted', target: folder.name }]);
    }
    res.json({ message: 'Folder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Documents
app.get('/api/documents', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch {
    res.json([]);
  }
});

app.post('/api/documents', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { name, size, folder_id, user_id } = req.body;
    if (!name || !size) return res.status(400).json({ error: 'Name and size are required' });

    const { data, error } = await supabase.from('documents').insert([{ name, size, folder_id: folder_id || null, user_id }]).select();
    if (error) return res.status(500).json({ error: error.message });

    await supabase.from('audit_logs').insert([{ action: 'Document Uploaded', target: name, user_id }]);
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { id } = req.params;
    const { data: doc } = await supabase.from('documents').select('name').eq('id', id).single();
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    if (doc) {
      await supabase.from('audit_logs').insert([{ action: 'Document Deleted', target: doc.name }]);
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Credentials
app.get('/api/credentials', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from('credentials').select('*').order('created_at', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch {
    res.json([]);
  }
});

app.post('/api/credentials', async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Database not connected' });
  try {
    const { label, secret, user_id } = req.body;
    if (!label || !secret) return res.status(400).json({ error: 'Label and secret are required' });

    const { data, error } = await supabase.from('credentials').insert([{ label, secret, user_id }]).select();
    if (error) return res.status(500).json({ error: error.message });

    await supabase.from('audit_logs').insert([{ action: 'Credential Saved', target: label, user_id }]);
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Audit Logs
app.get('/api/logs', async (req, res) => {
  if (!supabase) return res.json([]);
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) return res.json([]);
    res.json(data || []);
  } catch {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Vault Backend running securely on http://localhost:${PORT}`);
});