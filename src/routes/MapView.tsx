import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { BASEMAP_CONFIG, DEFAULT_ZOOM, DUISBURG_CENTER } from '../lib/config';
import { supabase } from '../lib/supabaseClient';
import { Address, AddressPhoto, Street } from '../types';
import { StreetAutocomplete } from '../components/StreetAutocomplete';
import { AddressCreateModal } from '../components/AddressCreateModal';
import { AddressDetailDrawer } from '../components/AddressDetailDrawer';

function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng);
    }
  });
  return null;
}

export function MapView() {
  const [streets, setStreets] = useState<Street[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(null);
  const [houseNumberFilter, setHouseNumberFilter] = useState('');
  const [createPos, setCreatePos] = useState<{ lat: number; lon: number } | null>(null);
  const [activeAddress, setActiveAddress] = useState<Address | null>(null);
  const [photos, setPhotos] = useState<Array<AddressPhoto & { signedUrl?: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const loadAddresses = async () => {
    const { data, error } = await supabase.from('addresses').select('*');
    if (error) {
      setError(error.message.includes('permission') ? 'Kein Zugriff (Allowlist).' : error.message);
      return;
    }
    setAddresses((data ?? []) as Address[]);
  };

  useEffect(() => {
    supabase.from('streets').select('*').order('name').then(({ data, error }) => {
      if (error) {
        setError(error.message.includes('permission') ? 'Kein Zugriff (Allowlist).' : error.message);
        return;
      }
      setStreets((data ?? []) as Street[]);
    });
    loadAddresses();
  }, []);

  useEffect(() => {
    const addressId = Number(searchParams.get('addressId'));
    if (addressId) {
      const found = addresses.find((entry) => entry.id === addressId);
      if (found) setActiveAddress(found);
    }
  }, [addresses, searchParams]);

  useEffect(() => {
    if (!activeAddress) {
      setPhotos([]);
      return;
    }
    supabase.from('address_photos').select('*').eq('address_id', activeAddress.id).then(async ({ data }) => {
      const rows = (data ?? []) as AddressPhoto[];
      const withUrls = await Promise.all(
        rows.map(async (photo) => {
          const { data } = await supabase.storage.from('address-photos').createSignedUrl(photo.storage_path, 60 * 60);
          return { ...photo, signedUrl: data?.signedUrl };
        })
      );
      setPhotos(withUrls);
    });
  }, [activeAddress]);

  const visibleAddresses = useMemo(() => {
    return addresses.filter((address) => {
      if (selectedStreet && address.street_id !== selectedStreet.id) return false;
      if (houseNumberFilter && !address.house_number.includes(houseNumberFilter)) return false;
      return true;
    });
  }, [addresses, selectedStreet, houseNumberFilter]);

  const streetNameById = useMemo(() => {
    const map = new Map<number, Street>();
    streets.forEach((street) => map.set(street.id, street));
    return map;
  }, [streets]);

  return (
    <main className="map-page">
      <div className="top-bar">
        <StreetAutocomplete streets={streets} value={selectedStreet} onSelect={setSelectedStreet} placeholder="Straße filtern" />
        <input placeholder="Hausnummer" value={houseNumberFilter} onChange={(e) => setHouseNumberFilter(e.target.value)} />
        <Link to="/favorites">Favoriten</Link>
      </div>
      {error && <p className="error-text floating">{error}</p>}
      <MapContainer center={DUISBURG_CENTER} zoom={DEFAULT_ZOOM} className="map-container">
        <TileLayer attribution={BASEMAP_CONFIG.primary.attribution} url={BASEMAP_CONFIG.primary.url} />
        <MapClickHandler onClick={(lat, lon) => setCreatePos({ lat, lon })} />
        {visibleAddresses
          .filter((entry) => Number.isFinite(entry.lat) && Number.isFinite(entry.lon))
          .map((entry) => (
            <Marker key={entry.id} position={[entry.lat, entry.lon]} eventHandlers={{ click: () => setActiveAddress(entry) }}>
              <Popup>{streetNameById.get(entry.street_id)?.name} {entry.house_number}</Popup>
            </Marker>
          ))}
      </MapContainer>

      <AddressCreateModal
        isOpen={Boolean(createPos)}
        streets={streets}
        lat={createPos?.lat ?? 0}
        lon={createPos?.lon ?? 0}
        onClose={() => setCreatePos(null)}
        onCreate={async ({ streetId, houseNumber, lat, lon }) => {
          const { error } = await supabase.from('addresses').insert({ street_id: streetId, house_number: houseNumber, lat, lon });
          if (error) throw new Error(error.message.includes('permission') ? 'Kein Zugriff (Allowlist).' : error.message);
          setCreatePos(null);
          await loadAddresses();
        }}
      />

      <AddressDetailDrawer
        address={activeAddress}
        street={activeAddress ? streetNameById.get(activeAddress.street_id) : undefined}
        photos={photos}
        onClose={() => setActiveAddress(null)}
        onSave={async (changes) => {
          if (!activeAddress) return;
          const { error } = await supabase.from('addresses').update(changes).eq('id', activeAddress.id);
          if (error) {
            setError(error.message.includes('permission') ? 'Kein Zugriff (Allowlist).' : error.message);
            return;
          }
          await loadAddresses();
        }}
        onUploadPhoto={async (file) => {
          if (!activeAddress) return;
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData.user?.id;
          if (!userId) throw new Error('Nicht eingeloggt.');
          const safeName = file.name.replace(/\s+/g, '-');
          const path = `${userId}/${activeAddress.id}/${crypto.randomUUID()}-${safeName}`;
          const { error: uploadError } = await supabase.storage.from('address-photos').upload(path, file);
          if (uploadError) throw uploadError;
          const { error: insertError } = await supabase.from('address_photos').insert({ address_id: activeAddress.id, storage_path: path });
          if (insertError) throw insertError;
          const { data } = await supabase.storage.from('address-photos').createSignedUrl(path, 60 * 60);
          setPhotos((prev) => [{ id: Date.now(), address_id: activeAddress.id, storage_path: path, created_at: new Date().toISOString(), caption: null, signedUrl: data?.signedUrl }, ...prev]);
        }}
        onDeletePhoto={async (photo) => {
          await supabase.storage.from('address-photos').remove([photo.storage_path]);
          await supabase.from('address_photos').delete().eq('id', photo.id);
          setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
        }}
      />
    </main>
  );
}
