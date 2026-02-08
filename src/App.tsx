import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './routes/Login';
import { MapView } from './routes/MapView';
import { Favorites } from './routes/Favorites';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/favorites" element={<Favorites />} />
    </Routes>
  );
}
