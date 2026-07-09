import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>📚</span>
          <h2>Biblioteca</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/libros" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            📖 Libros
          </NavLink>
          <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            👤 Usuarios
          </NavLink>
          <NavLink to="/prestamos" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🔄 Préstamos
          </NavLink>
          <NavLink to="/multas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            💰 Multas
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
