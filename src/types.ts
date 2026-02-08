export type Traffic = 'green' | 'yellow' | 'red';
export type BuildingType = 'unknown' | 'efh' | 'mfh';

export interface Street {
  id: number;
  name: string;
  city: string;
}

export interface Address {
  id: number;
  street_id: number;
  house_number: string;
  lat: number;
  lon: number;
  traffic: Traffic;
  is_favorite: boolean;
  building: BuildingType;
  floors: number | null;
  parking: string | null;
  has_garage: boolean;
  shops: string | null;
  orientation_front: string | null;
  orientation_back: string | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
  street?: Street;
}

export interface AddressPhoto {
  id: number;
  address_id: number;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface AddressWithStreet extends Address {
  street: Street;
}
