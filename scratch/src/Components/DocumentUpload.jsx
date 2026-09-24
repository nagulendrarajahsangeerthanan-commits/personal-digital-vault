import { useState } from 'react';

export default function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  }

  function handleClearFile() {
    setSelectedFile(null);
  }

  return (
    <section>
      <h2>Upload Document</h2>

      {/* Plain File Input */}
      <input type="file" onChange={handleFileChange} />

      {/* File Select aana pin kaattum Details */}
      {selectedFile && (
        <div>
          <p>Selected File: {selectedFile.name}</p>
          <p>File Size: {Math.round(selectedFile.size / 1024)} KB</p>
          <button onClick={handleClearFile}>Remove</button>
        </div>
      )}
    </section>
  );
}