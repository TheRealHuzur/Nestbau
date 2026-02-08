import { useRef, useState } from 'react';
import { AddressPhoto } from '../types';

interface PhotoGalleryProps {
  photos: Array<AddressPhoto & { signedUrl?: string }>;
  onUpload: (file: File, caption?: string) => Promise<void>;
  onDelete: (photo: AddressPhoto) => Promise<void>;
}

export function PhotoGallery({ photos, onUpload, onDelete }: PhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <section>
      <h3>Fotos</h3>
      <div className="row gap">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          Foto hochladen
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            if (!files.length) return;
            setBusy(true);
            for (const file of files) {
              await onUpload(file);
            }
            setBusy(false);
            event.target.value = '';
          }}
        />
      </div>
      <div className="gallery">
        {photos.map((photo) => (
          <figure key={photo.id} className="photo-card">
            {photo.signedUrl ? <img src={photo.signedUrl} alt={photo.caption ?? 'Adresse'} /> : <div>Bild lädt…</div>}
            <figcaption>
              {photo.caption ?? 'Ohne Caption'}
              <button className="danger" onClick={() => onDelete(photo)}>
                Löschen
              </button>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
