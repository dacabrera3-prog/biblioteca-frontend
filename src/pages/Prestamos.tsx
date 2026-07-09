import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Prestamo {
  id: number;
  usuarioId: number;
  libroId: number;
  fechaPrestamo: string;
  fechaDevolucion: string | null;
  estado: string;
  usuario?: { nombre: string };
  libro?: { titulo: string };
}

interface Libro { id: number; titulo: string; }
interface Usuario { id: number; nombre: string; }

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({ usuarioId: '', libroId: '', fechaDevolucion: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, lRes, uRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/libros'),
        api.get('/usuarios'),
      ]);
      setPrestamos(pRes.data);
      setLibros(lRes.data);
      setUsuarios(uRes.data);
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/prestamos', {
        usuarioId: Number(form.usuarioId),
        libroId: Number(form.libroId),
        fechaDevolucion: form.fechaDevolucion || undefined,
      });
      setShowModal(false);
      setForm({ usuarioId: '', libroId: '', fechaDevolucion: '' });
      fetchAll();
    } catch {
      setError('Error al crear préstamo');
    }
  };

  const handleDevolver = async (id: number) => {
    if (!confirm('¿Marcar como devuelto?')) return;
    try {
      await api.post(`/prestamos/${id}/devolver`);
      fetchAll();
    } catch {
      setError('Error al registrar devolución');
    }
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>🔄 Préstamos</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nuevo préstamo</button>
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
                <th>Usuario</th>
                <th>Libro</th>
                <th>Fecha préstamo</th>
                <th>Fecha devolución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.length === 0 ? (
                <tr><td colSpan={7} className="empty">No hay préstamos</td></tr>
              ) : (
                prestamos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.usuario?.nombre || `Usuario #${p.usuarioId}`}</td>
                    <td>{p.libro?.titulo || `Libro #${p.libroId}`}</td>
                    <td>{formatFecha(p.fechaPrestamo)}</td>
                    <td>{formatFecha(p.fechaDevolucion)}</td>
                    <td>
                      <span className={`badge ${p.estado === 'ACTIVO' ? 'badge-active' : 'badge-done'}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="actions">
                      {p.estado === 'ACTIVO' && (
                        <button className="btn-edit" onClick={() => handleDevolver(p.id)}>
                          Devolver
                        </button>
                      )}
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
            <h3>Nuevo préstamo</h3>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Usuario</label>
                <select value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: e.target.value })} required>
                  <option value="">Selecciona un usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Libro</label>
                <select value={form.libroId} onChange={(e) => setForm({ ...form, libroId: e.target.value })} required>
                  <option value="">Selecciona un libro</option>
                  {libros.map((l) => (
                    <option key={l.id} value={l.id}>{l.titulo}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de devolución esperada</label>
                <input type="date" value={form.fechaDevolucion} onChange={(e) => setForm({ ...form, fechaDevolucion: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Crear préstamo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
