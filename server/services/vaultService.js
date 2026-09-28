import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!supabase) {
  console.warn('⚠️ Supabase credentials missing in server/.env');
}

export const vaultService = {
  // Automated Security Audit Logging
  async logActivity(action, target, user_id = null) {
    if (!supabase) return;
    try {
      await supabase.from('audit_logs').insert([{ action, target, user_id }]);
    } catch (err) {
      console.error('Audit log failure:', err.message);
    }
  },

  // Stats
  async getVaultStats() {
    if (!supabase) return { documentsCount: 0, foldersCount: 0, credentialsCount: 0 };
    const [docsRes, foldersRes, credsRes] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('folders').select('*', { count: 'exact', head: true }),
      supabase.from('credentials').select('*', { count: 'exact', head: true })
    ]);
    return {
      documentsCount: docsRes.count || 0,
      foldersCount: foldersRes.count || 0,
      credentialsCount: credsRes.count || 0
    };
  },

  // Folders
  async getAllFolders() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createFolder(name, user_id) {
    if (!supabase) throw new Error('Database not connected');
    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, user_id }])
      .select()
      .single();

    if (error) throw error;
    await this.logActivity('Folder Created', name, user_id);
    return data;
  },

  async deleteFolder(id) {
    if (!supabase) throw new Error('Database not connected');
    const { data: folder } = await supabase
      .from('folders')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('folders').delete().eq('id', id);
    if (error) throw error;

    if (folder) {
      await this.logActivity('Folder Deleted', folder.name);
    }
    return { success: true };
  },

  // Documents (with Freemium Quota Enforcement)
  async getAllDocuments() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async uploadDocument({ name, size, folder_id, user_id, plan_tier }) {
    if (!supabase) throw new Error('Database not connected');

    // Quota Enforcement: Free tier can upload maximum 5 documents
    if (plan_tier !== 'pro') {
      const { count, error: countErr } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user_id);

      if (!countErr && count >= 5) {
        const quotaError = new Error('Free tier quota exceeded (Max 5 documents). Upgrade to Pro for unlimited storage!');
        quotaError.statusCode = 402;
        throw quotaError;
      }
    }

    const { data, error } = await supabase
      .from('documents')
      .insert([{ name, size, folder_id: folder_id || null, user_id }])
      .select()
      .single();

    if (error) throw error;
    await this.logActivity('Document Uploaded', name, user_id);
    return data;
  },

  async deleteDocument(id) {
    if (!supabase) throw new Error('Database not connected');
    const { data: doc } = await supabase
      .from('documents')
      .select('name')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;

    if (doc) {
      await this.logActivity('Document Deleted', doc.name);
    }
    return { success: true };
  },

  // Confidential Credentials
  async getAllCredentials() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async saveCredential(label, secret, user_id) {
    if (!supabase) throw new Error('Database not connected');
    const { data, error } = await supabase
      .from('credentials')
      .insert([{ label, secret, user_id }])
      .select()
      .single();

    if (error) throw error;
    await this.logActivity('Credential Saved', label, user_id);
    return data;
  },

  // Audit Logs
  async getAuditLogs() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }
};