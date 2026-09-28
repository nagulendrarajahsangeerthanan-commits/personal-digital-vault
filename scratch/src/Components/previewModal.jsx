

export default function PreviewModal({ previewDoc, onClose }) {
  if (!previewDoc) return null;

  return (
    <dialog className="preview-modal" open>
      <header className="modal-header">
        <h3>Document Preview</h3>
        <button type="button" className="close-btn" onClick={onClose}>✕</button>
      </header>
      <div className="modal-body">
        <p><strong>File Name:</strong> {previewDoc.name}</p>
        <p><strong>Size:</strong> {previewDoc.size}</p>
        <p><strong>Status:</strong> Stored securely in PostgreSQL</p>
        <div className="modal-shield">
          <span>🔒 Protected by AES-256 Vault Encryption</span>
        </div>
      </div>
      <footer className="modal-footer">
        <button type="button" className="btn-primary" onClick={onClose}>Close</button>
      </footer>
    </dialog>
  );
}