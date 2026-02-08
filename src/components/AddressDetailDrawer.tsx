import { useEffect, useState } from 'react';
import { Address, AddressPhoto, BuildingType, Street, Traffic } from '../types';
import { PhotoGallery } from './PhotoGallery';

interface AddressDetailDrawerProps {
  address: Address | null;
  street?: Street;
  photos: Array<AddressPhoto & { signedUrl?: string }>;
  onClose: () => void;
  onSave: (changes: Partial<Address>) => Promise<void>;
  onUploadPhoto: (file: File, caption?: string) => Promise<void>;
  onDeletePhoto: (photo: AddressPhoto) => Promise<void>;
}

export function AddressDetailDrawer({
  address,
  street,
  photos,
  onClose,
  onSave,
  onUploadPhoto,
  onDeletePhoto
}: AddressDetailDrawerProps) {
  const [form, setForm] = useState<Partial<Address>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(address ?? {});
  }, [address]);

  if (!address) return null;

  return (
    <aside className="drawer">
      <div className="row between">
        <h2>{street?.name ?? 'Unbekannte Straße'} {address.house_number}</h2>
        <button className="ghost" onClick={onClose}>Schließen</button>
      </div>

      <div className="traffic-buttons">
        {(['green', 'yellow', 'red'] as Traffic[]).map((traffic) => (
          <button
            key={traffic}
            className={`traffic ${traffic} ${form.traffic === traffic ? 'active' : ''}`}
            onClick={() => setForm((prev) => ({ ...prev, traffic }))}
          >
            {traffic.toUpperCase()}
          </button>
        ))}
      </div>

      <label className="checkbox-line">
        <input
          type="checkbox"
          checked={Boolean(form.is_favorite)}
          onChange={(event) => setForm((prev) => ({ ...prev, is_favorite: event.target.checked }))}
        />
        Favorit
      </label>

      <select
        value={form.building ?? 'unknown'}
        onChange={(event) => setForm((prev) => ({ ...prev, building: event.target.value as BuildingType }))}
      >
        <option value="unknown">Unbekannt</option>
        <option value="efh">EFH</option>
        <option value="mfh">MFH</option>
      </select>
      <input type="number" placeholder="Etagen" value={form.floors ?? ''} onChange={(e) => setForm((p) => ({ ...p, floors: e.target.value ? Number(e.target.value) : null }))} />
      <input type="text" placeholder="Parken" value={form.parking ?? ''} onChange={(e) => setForm((p) => ({ ...p, parking: e.target.value }))} />
      <label className="checkbox-line">
        <input type="checkbox" checked={Boolean(form.has_garage)} onChange={(e) => setForm((p) => ({ ...p, has_garage: e.target.checked }))} />
        Garage vorhanden
      </label>
      <input type="text" placeholder="Shops" value={form.shops ?? ''} onChange={(e) => setForm((p) => ({ ...p, shops: e.target.value }))} />
      <input type="text" placeholder="Ausrichtung vorne" value={form.orientation_front ?? ''} onChange={(e) => setForm((p) => ({ ...p, orientation_front: e.target.value }))} />
      <input type="text" placeholder="Ausrichtung hinten" value={form.orientation_back ?? ''} onChange={(e) => setForm((p) => ({ ...p, orientation_back: e.target.value }))} />
      <textarea placeholder="Notizen" value={form.notes ?? ''} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />

      <button
        onClick={async () => {
          setSaving(true);
          await onSave(form);
          setSaving(false);
        }}
        disabled={saving}
      >
        {saving ? 'Speichert…' : 'Speichern'}
      </button>

      <PhotoGallery photos={photos} onUpload={onUploadPhoto} onDelete={onDeletePhoto} />
    </aside>
  );
}
