import { useState } from 'react';

export default function FolderList() {
  const [folders, setFolders] = useState([
    { id: 1, name: 'Passport & ID' },
    { id: 2, name: 'Bank Documents' }
  ]);

  function handleAddFolder() {
    const folderName = prompt('Folder peyarai type seiyungal:');
    if (folderName) {
      setFolders([...folders, { id: Date.now(), name: folderName }]);
    }
  }

  function handleDeleteFolder(idToDelete) {
    setFolders(folders.filter((folder) => folder.id !== idToDelete));
  }

  return (
    <section>
      <h2>Vault Folders ({folders.length})</h2>
      <button onClick={handleAddFolder}>+ Add New Folder</button>

      <ul>
        {folders.map((folder) => (
          <li key={folder.id}>
            <span>📁 {folder.name} </span>
            <button onClick={() => handleDeleteFolder(folder.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}