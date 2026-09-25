import { useState } from 'react';

export default function AuthView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both email and password.');
      return;
    }
    // Simulate authentication success
    onLoginSuccess({ email });
  }

  return (
    <section>
      <h2>Vault Sign In / Access</h2>
      <p>Secure client-side cryptographic access key</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email Address:</label>
          <input
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Access Password:</label>
          <input
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Unlock Vault</button>
      </form>
    </section>
  );
}