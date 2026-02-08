import { Street } from '../types';

interface StreetAutocompleteProps {
  streets: Street[];
  value?: Street | null;
  onSelect: (street: Street | null) => void;
  placeholder?: string;
}

export function StreetAutocomplete({ streets, value, onSelect, placeholder }: StreetAutocompleteProps) {
  const listId = 'streets-list';

  return (
    <div className="street-autocomplete">
      <input
        list={listId}
        value={value?.name ?? ''}
        placeholder={placeholder ?? 'Straße suchen'}
        onChange={(event) => {
          const selected = streets.find((street) => street.name === event.target.value) ?? null;
          onSelect(selected);
        }}
      />
      <datalist id={listId}>
        {streets.map((street) => (
          <option key={street.id} value={street.name} />
        ))}
      </datalist>
    </div>
  );
}
