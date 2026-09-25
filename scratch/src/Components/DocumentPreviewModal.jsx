export default function DocumentPreviewModal({ file, onClose }) {
    if (!file) return null;
  
    return (
      <dialog open>
        <article>
          <header>
            <h3>Document Preview</h3>
            <button type="button" onClick={onClose}>Close</button>
          </header>
  
          <div>
            <p><strong>File Name:</strong> {file.name}</p>
            <p><strong>File Size:</strong> {file.size}</p>
            <p><strong>Upload Date:</strong> {file.date}</p>
            <p><strong>Encryption:</strong> AES-256 Client-Side</p>
          </div>
  
          <footer>
            <button type="button" onClick={() => alert(`Downloading: ${file.name}`)}>
              Download Decrypted
            </button>
          </footer>
        </article>
      </dialog>
    );
  }