import { useState } from 'react';

export default function CredentialVault() {
  const [credentials, setCredentials] = useState([
    { id: 101, title: 'GitHub Token', secret: 'ghp_secretToken999', isVisible: false },
    { id: 102, title: 'Supabase DB Pass', secret: 'Postgres#2026!Vault', isVisible: false }
  ]);

  function toggleSecretVisibility(credId) {
    const updated = credentials.map((item) => {
      if (item.id === credId) {
        return { ...item, isVisible: !item.isVisible };
      }
      return item;
    });
    setCredentials(updated);
  }

  return (
    <section>
      <h2>Confidential Credentials ({credentials.length})</h2>

      <ul>
        {credentials.map((item) => (
          <li key={item.id}>
            <strong>{item.title}: </strong>

            {/* Masking Logic: isVisible true endraal secret theriyum, illai endraal dots */}
            <span>
              {item.isVisible ? item.secret : '••••••••••••'}
            </span>

            {/* Hide / Reveal Button */}
            <button onClick={() => toggleSecretVisibility(item.id)}>
              {item.isVisible ? 'Hide' : 'Reveal'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}