# Duisburg Wohn-Straßen (Beta)

Private PWA zur Bewertung von Straßen und Adressen in Duisburg.

## Setup

Note: GitHub Pages deploy uses GitHub Actions.

1. Dependencies installieren:
   ```bash
   npm install
   ```
2. `.env.local` anlegen (nicht committen):
   ```env
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```
3. App starten:
   ```bash
   npm run dev
   ```

## Login

- Anmeldung über E-Mail + Passwort (Supabase Auth).
- Signups sind deaktiviert; es können nur freigeschaltete Nutzer auf die App zugreifen.
- Bei fehlender Berechtigung wird „Kein Zugriff (Allowlist)“ angezeigt.

## Routen

- `/login` – Login/Logout
- `/map` – Karte, Adressen anlegen, Details/Fotos
- `/favorites` – Favoritenliste
