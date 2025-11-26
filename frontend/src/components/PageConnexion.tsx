import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PageConnexion() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setError('');
      navigate('/users');
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: '3rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Identifiant<br />
            <input
              autoFocus
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Mot de passe<br />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </label>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
