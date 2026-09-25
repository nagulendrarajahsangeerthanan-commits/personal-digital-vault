import { useState } from 'react';

export default function DocumentList({ searchQuery = '' }) {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'National_Identity_Card.pdf', size: '1.2 MB', date: '2026-03-24' },
    { id: 2, name: 'Bank_Statement_Jan.pdf', size: '3.4 MB', date: '2026-03-22' },
    { id: 3, name: 'Work_Experience_Letter.pdf', size: '850 KB', date: '2026-03-20' }
  ]);

  function handleDelete(id) {
    setDocuments(documents.filter((doc) => doc.id !== id));
  }

  // Filter logic based on search text
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section>
      <h2>Vault Documents ({filteredDocuments.length})</h2>

      {filteredDocuments.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>No documents matched your search.</p>
      ) : (
        <ul>
          {filteredDocuments.map((doc) => (
            <li key={doc.id}>
              <span>📄 {doc.name}</span>
              <small>{doc.size} — {doc.date}</small>
              <div>
                <button type="button" onClick={() => alert(`Downloading: ${doc.name}`)}>
                  Download
                </button>
                <button type="button" onClick={() => handleDelete(doc.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}