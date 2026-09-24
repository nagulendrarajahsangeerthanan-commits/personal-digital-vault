import { useState } from "react";

export default function App() {
  const [folders, setFolders] = useState([
    { id: 1, name: "Passport&ID" },
    { id: 2, name: "Bank Documents" },
  ]);

  function handleAddFolder(){
    const folderName = prompt('Folder peyarai type seiyungal:');

    if(folderName){
      const newFolder = {
        id:Date.now(),
        name:folderName
      };
      setFolders([...folders,newFolder])
    }
  }

  return (
    <div>
      <h1>🛡️ personal Digital vault</h1>
      <p>Secure storage for confidential assets</p>
      <button   onClick={handleAddFolder}                 >
        +Add New Folder
      </button>
      <ul>
        {folders.map((folder) => (
          <li key={folder.id}>📁{folder.name}</li>
        ))}
      </ul>
    </div>
  );
}
