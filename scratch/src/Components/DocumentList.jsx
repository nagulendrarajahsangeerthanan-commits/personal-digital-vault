import { useState } from 'react';
import DocumentPreviewModal from './DocumentPreviewModal';

export default function DocumentList({ searchQuery = '' }) {
  // Uploaded documents state (Dummy data for testing)
  const [documents, setDocuments] = useState([
    { id: 1, title: 'National_Identity_Card.pdf', size: '1.2 MB', date: '2026-03-24' },
    { id: 2, title: 'Bank_Statement_Jan.pdf', size: '3.4 MB', date: '2026-03-22' }
  ]);

  // Preview modal tracking state
  const [previewDoc, setPreviewDoc] = useState(null);

  function handleDeleteDocument(docId) {
    setDocuments(documents.filter((doc) => doc.id !== docId));
  }

  // Filter based on Member 2 search query
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section>
      <h2>Vault Documents ({filteredDocuments.length})</h2>

      <ul>
        {filteredDocuments.map((doc) => (
          <li key={doc.id}>
            <strong>📄 {doc.title}</strong> — 
            <span> {doc.size} </span> — 
            <small> (Uploaded: {doc.date}) </small>

            <button type="button" onClick={() => setPreviewDoc(doc)}>
              Preview
            </button>

            <button type="button" onClick={() => alert(`Downloading ${doc.title}...`)}>
              Download
            </button>

            <button type="button" onClick={() => handleDeleteDocument(doc.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Modal Conditional Render */}
      {previewDoc && (
        <DocumentPreviewModal
          file={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </section>
  );
}