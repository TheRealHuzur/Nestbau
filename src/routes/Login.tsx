import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { envMissing, supabase } from '../lib/supabaseClient';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  return (
    <main className="page login-page">
      <h1>Login</h1>
      {envMissing && <p className="error-text">Umgebungsvariablen fehlen (.env.local prüfen).</p>}
      {error && <p className="error-text">{error}</p>}
      <input type="email" placeholder="E-Mail" value={email} onChange={(event) => setEmail(event.target.value)} />
      <input type="password" placeholder="Passwort" value={password} onChange={(event) => setPassword(event.target.value)} />
      <button
        disabled={loading || envMissing}
        onClick={async () => {
          setLoading(true);
          setError(null);
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          setLoading(false);
          if (signInError) {
            if (signInError.message.toLowerCase().includes('invalid login')) {
              setError('Falsche Zugangsdaten.');
            } else if (signInError.message.toLowerCase().includes('not allowed')) {
              setError('Kein Zugriff (Allowlist).');
            } else {
              setError(signInError.message);
            }
            return;
          }
          navigate('/map');
        }}
      >
        {loading ? 'Anmeldung…' : 'Einloggen'}
      </button>
      {hasSession && (
        <button
          className="ghost"
          onClick={async () => {
            await supabase.auth.signOut();
            setHasSession(false);
          }}
        >
          Logout
        </button>
      )}
      <p><Link to="/map">Zur Karte</Link> (nur mit Login nutzbar)</p>
    </main>
  );
}
