import { useState } from 'react';

export default function DocumentList() {
  // Uploaded documents state (Dummy data for testing)
  const [documents, setDocuments] = useState([
    { id: 1, title: 'National_Identity_Card.pdf', size: '1.2 MB', date: '2026-03-24' },
    { id: 2, title: 'Bank_Statement_Jan.pdf', size: '3.4 MB', date: '2026-03-22' }
  ]);

  function handleDeleteDocument(docId) {
    setDocuments(documents.filter((doc) => doc.id !== docId));
  }

  return (
    <section>
      <h2>Vault Documents ({documents.length})</h2>

      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <strong>📄 {doc.title}</strong> — 
            <span> {doc.size} </span> — 
            <small> (Uploaded: {doc.date}) </small>

            <button onClick={() => alert(`Downloading ${doc.title}...`)}>
              Download
            </button>

            <button onClick={() => handleDeleteDocument(doc.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}