import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, usuario, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const esAdmin = hasRole('ADMINISTRADOR', 'SUBADMINISTRADOR');
  const esBibliotecario = hasRole('BIBLIOTECARIO');
  const _esAdminOBiblio = esAdmin || esBibliotecario; void _esAdminOBiblio;

  const rolLabel: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    SUBADMINISTRADOR: 'Subadministrador',
    BIBLIOTECARIO: 'Bibliotecario',
    PROFESOR: 'Profesor',
    ESTUDIANTE: 'Estudiante',
    CLIENTE: 'Cliente',
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>📚</span>
          <h2>Biblioteca</h2>
        </div>

        {usuario && (
          <div className="sidebar-user">
            <p className="user-name">{usuario.nombre} {usuario.apellido}</p>
            <span className="user-role">{rolLabel[usuario.rol] ?? usuario.rol}</span>
          </div>
        )}

        <nav className="sidebar-nav">
          {/* Libros: todos pueden ver */}
          <NavLink to="/libros" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            📖 Libros
          </NavLink>

          {/* Préstamos: todos pueden ver/crear */}
          <NavLink to="/prestamos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🔄 Préstamos
          </NavLink>

          {/* Multas: todos pueden ver */}
          <NavLink to="/multas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            💰 Multas
          </NavLink>

          {/* Usuarios: solo admin y subadmin */}
          {esAdmin && (
            <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              👤 Usuarios
            </NavLink>
          )}

          {/* Registros/auditoría: solo admin */}
          {esAdmin && (
            <NavLink to="/registros" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              📋 Registros
            </NavLink>
          )}

          {/* Mi perfil: todos */}
          <NavLink to="/perfil" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            ⚙️ Mi Perfil
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="btn-logout">
          🚪 Cerrar sesión
        </button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
