
import  { useState } from 'react';

export default function CredentialsView({
  credentials, addCredential, toggleCredentialVisibility, copyCredentialSecret
}) {
  const [label, setLabel] = useState('');
  const [secret, setSecret] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    addCredential(label, secret);
    setLabel('');
    setSecret('');
  };

  return (
    <section className="section-card">
      <h2>Protected Credentials Locker</h2>
      <p className="section-desc">Store bank PINs, API secrets, and server keys with AES masking.</p>
      <form onSubmit={onSubmit} className="inline-form" style={{ marginTop: '16px' }}>
        <input
          type="text"
          placeholder="Account / Secret Label (e.g. Supabase Key)..."
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          type="password"
          placeholder="Secret Key Value..."
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <button type="submit" className="btn-primary">Save Key</button>
      </form>

      <div className="credentials-grid">
        {credentials.length === 0 ? (
          <p className="empty-text">No confidential credentials stored yet.</p>
        ) : (
          credentials.map((cred) => (
            <div key={cred.id} className="cred-card">
              <div className="cred-header">
                <strong>🔐 {cred.label}</strong>
                <span className="badge-secure">Encrypted</span>
              </div>
              <div className="cred-secret-box">
                <code>{cred.visible ? cred.secret : '••••••••••••••••••••••••'}</code>
              </div>
              <div className="cred-actions">
                <button type="button" onClick={() => toggleCredentialVisibility(cred.id)}>
                  {cred.visible ? 'Hide' : 'Reveal'}
                </button>
                <button type="button" onClick={() => copyCredentialSecret(cred.secret, cred.label)}>
                  Copy Secret
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}