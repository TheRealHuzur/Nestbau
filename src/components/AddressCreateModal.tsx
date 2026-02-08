import { useState } from 'react';
import { Street } from '../types';
import { StreetAutocomplete } from './StreetAutocomplete';

interface AddressCreateModalProps {
  isOpen: boolean;
  streets: Street[];
  lat: number;
  lon: number;
  onClose: () => void;
  onCreate: (payload: { streetId: number; houseNumber: string; lat: number; lon: number }) => Promise<void>;
}

export function AddressCreateModal({ isOpen, streets, lat, lon, onClose, onCreate }: AddressCreateModalProps) {
  const [street, setStreet] = useState<Street | null>(null);
  const [houseNumber, setHouseNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Adresse anlegen</h2>
        <p>Koordinaten: {lat.toFixed(5)}, {lon.toFixed(5)}</p>
        <StreetAutocomplete streets={streets} value={street} onSelect={setStreet} placeholder="Straße auswählen" />
        <input
          type="text"
          placeholder="Hausnummer"
          value={houseNumber}
          onChange={(event) => setHouseNumber(event.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <div className="row gap">
          <button className="ghost" onClick={onClose}>Abbrechen</button>
          <button
            onClick={async () => {
              if (!street || !houseNumber.trim()) {
                setError('Bitte Straße und Hausnummer ausfüllen.');
                return;
              }
              setSaving(true);
              setError(null);
              try {
                await onCreate({ streetId: street.id, houseNumber: houseNumber.trim(), lat, lon });
                setHouseNumber('');
                setStreet(null);
              } catch (createError) {
                setError((createError as Error).message);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            {saving ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
