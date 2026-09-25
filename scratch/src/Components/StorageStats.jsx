<<<<<<< HEAD
export default function StorageStats() {
    return (
      <section>
        <h2>Vault Storage & Metrics</h2>
        <p>Total Documents: 2</p>
        <p>Active Folders: 2</p>
        <p>Estimated Storage: 4.6 MB / 100 MB</p>
=======
export default function StorageStats({ totalDocs = 3, totalFolders = 2, totalSecrets = 2 }) {
    return (
      <section>
        <h2>Vault Storage & Security Overview</h2>
        
        <div>
          <p><strong>Total Files:</strong> {totalDocs}</p>
          <p><strong>Active Folders:</strong> {totalFolders}</p>
          <p><strong>Stored Credentials:</strong> {totalSecrets}</p>
          <p><strong>Estimated Used Space:</strong> 5.45 MB / 100 MB</p>
        </div>
>>>>>>> origin/main
      </section>
    );
  }