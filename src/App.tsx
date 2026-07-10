import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Libros from './pages/Libros';
import Usuarios from './pages/Usuarios';
import Prestamos from './pages/Prestamos';
import Multas from './pages/Multas';
import Perfil from './pages/Perfil';
import Registros from './pages/Registros';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/libros" element={<PrivateRoute><Libros /></PrivateRoute>} />
          <Route path="/prestamos" element={<PrivateRoute><Prestamos /></PrivateRoute>} />
          <Route path="/multas" element={<PrivateRoute><Multas /></PrivateRoute>} />
          <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

          {/* Solo admin y subadmin */}
          <Route path="/usuarios" element={
            <PrivateRoute>
              <RoleRoute roles={['ADMINISTRADOR', 'SUBADMINISTRADOR']}>
                <Usuarios />
              </RoleRoute>
            </PrivateRoute>
          } />

          <Route path="/registros" element={
            <PrivateRoute>
              <RoleRoute roles={['ADMINISTRADOR', 'SUBADMINISTRADOR']}>
                <Registros />
              </RoleRoute>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/libros" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
