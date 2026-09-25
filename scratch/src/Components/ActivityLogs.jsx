import { useState } from 'react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([
    { id: 1, action: 'Document uploaded: National_Identity_Card.pdf', time: '10:30 AM' },
    { id: 2, action: 'Credential revealed: GitHub Token', time: '10:35 AM' }
  ]);

  return (
    <section>
      <h2>Vault Activity Logs ({logs.length})</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <span>{log.action}</span>
            <small> — {log.time}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}