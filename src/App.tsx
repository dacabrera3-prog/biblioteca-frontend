import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Libros from './pages/Libros';
import Usuarios from './pages/Usuarios';
import Prestamos from './pages/Prestamos';
import Multas from './pages/Multas';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/libros" element={<PrivateRoute><Libros /></PrivateRoute>} />
          <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
          <Route path="/prestamos" element={<PrivateRoute><Prestamos /></PrivateRoute>} />
          <Route path="/multas" element={<PrivateRoute><Multas /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/libros" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
