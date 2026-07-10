import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

const emptyForm = { nombre: '', apellido: '', email: '', password: '', rol: 'CLIENTE' };

const rolLabel: Record<string, string> = {
  ADMINISTRADOR: 'Administrador',
  SUBADMINISTRADOR: 'Subadministrador',
  BIBLIOTECARIO: 'Bibliotecario',
  PROFESOR: 'Profesor',
  ESTUDIANTE: 'Estudiante',
  CLIENTE: 'Cliente',
};

const rolBadge: Record<string, string> = {
  ADMINISTRADOR: 'badge-admin',
  SUBADMINISTRADOR: 'badge-admin',
  BIBLIOTECARIO: 'badge-active',
  PROFESOR: 'badge-active',
  ESTUDIANTE: 'badge-user',
  CLIENTE: 'badge-user',
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (u: Usuario) => {
    setForm({ nombre: u.nombre, apellido: u.apellido ?? '', email: u.email, password: '', rol: u.rol });
    setEditId(u.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        const payload: Record<string, string> = { nombre: form.nombre, apellido: form.apellido, email: form.email, rol: form.rol };
        if (form.password) payload.password = form.password;
        await api.patch(`/usuarios/${editId}`, payload);
      } else {
        await api.post('/usuarios', form);
      }
      setShowModal(false);
      fetchUsuarios();
    } catch {
      setError('Error al guardar usuario');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      fetchUsuarios();
    } catch {
      setError('Error al eliminar');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>👤 Usuarios</h2>
        <button className="btn-primary" onClick={openCreate}>+ Nuevo usuario</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="loading">Cargando...</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr><td colSpan={6} className="empty">No hay usuarios</td></tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre}</td>
                    <td>{u.apellido}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${rolBadge[u.rol] ?? 'badge-user'}`}>{rolLabel[u.rol] ?? u.rol}</span></td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openEdit(u)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(u.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
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
                <label>{editId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editId}
                  placeholder={editId ? 'Dejar vacío para no cambiar' : ''}
                />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="SUBADMINISTRADOR">Subadministrador</option>
                  <option value="BIBLIOTECARIO">Bibliotecario</option>
                  <option value="PROFESOR">Profesor</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
