import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Address, Street } from '../types';

interface FavoriteAddress extends Address {
  street?: Street;
}

export function Favorites() {
  const [items, setItems] = useState<FavoriteAddress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from('addresses')
      .select('*, street:streets(*)')
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message.includes('permission') ? 'Kein Zugriff (Allowlist).' : error.message);
          return;
        }
        setItems((data ?? []) as FavoriteAddress[]);
      });
  }, []);

  return (
    <main className="page">
      <h1>Favoriten</h1>
      <p><Link to="/map">Zur Karte</Link></p>
      {error && <p className="error-text">{error}</p>}
      <ul className="favorites-list">
        {items.map((item) => (
          <li key={item.id} onClick={() => navigate(`/map?addressId=${item.id}`)}>
            <span className={`traffic-dot ${item.traffic}`}></span>
            <strong>{item.street?.name} {item.house_number}</strong>
            <small>{item.notes?.slice(0, 80) ?? 'Keine Notiz'}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
