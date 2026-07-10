import { useState, FormEvent } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Perfil() {
  const { usuario } = useAuth();

  const [form, setForm] = useState({
    nombre: usuario?.nombre ?? '',
    apellido: usuario?.apellido ?? '',
    email: usuario?.email ?? '',
    password: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
      };
      if (form.password) payload.password = form.password;

      await api.patch(`/usuarios/${usuario?.id}`, payload);
      setSuccess('Perfil actualizado correctamente');
      setForm({ ...form, password: '' });
    } catch {
      setError('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const rolLabel: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    SUBADMINISTRADOR: 'Subadministrador',
    BIBLIOTECARIO: 'Bibliotecario',
    PROFESOR: 'Profesor',
    ESTUDIANTE: 'Estudiante',
    CLIENTE: 'Cliente',
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>⚙️ Mi Perfil</h2>
      </div>

      <div className="perfil-container">
        <div className="perfil-info">
          <div className="perfil-avatar">
            {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
          </div>
          <div>
            <h3>{usuario?.nombre} {usuario?.apellido}</h3>
            <span className={`badge ${usuario?.rol === 'ADMINISTRADOR' ? 'badge-admin' : 'badge-user'}`}>
              {rolLabel[usuario?.rol ?? ''] ?? usuario?.rol}
            </span>
            <p className="perfil-email">{usuario?.email}</p>
          </div>
        </div>

        <div className="table-wrapper" style={{ padding: '24px', marginTop: '24px' }}>
          <h3 style={{ marginBottom: '20px', color: '#1e3a5f' }}>Editar datos</h3>
          <form onSubmit={handleSave} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Nueva contraseña (opcional)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
