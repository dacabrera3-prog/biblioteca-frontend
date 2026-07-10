import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Prestamo {
  id: number;
  usuarioId: number;
  libroId: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  fechaDevueltaReal: string | null;
  estado: string;
  costoPrestamo?: number;
  tipoDocRetenido?: string;
  observaciones?: string;
  usuario?: { nombre: string; apellido: string; rol: string };
  libro?: { titulo: string };
}

interface Libro { id: number; titulo: string; disponibles: number; }
interface Usuario { id: number; nombre: string; apellido: string; rol: string; }

export default function Prestamos() {
  const { hasRole, usuario: usuarioActual } = useAuth();
  const esAdmin = hasRole('ADMINISTRADOR', 'SUBADMINISTRADOR');
  const esBibliotecario = hasRole('BIBLIOTECARIO');
  const esAdminOBiblio = esAdmin || esBibliotecario;
  const esProfesor = hasRole('PROFESOR');
  const esEstudiante = hasRole('ESTUDIANTE');

  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState({
    usuarioId: '',
    libroId: '',
    fechaDevolucion: '',
    tipoDocRetenido: '',
    observaciones: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      let prestamosData;
      // Usuarios no-admin solo ven sus propios préstamos
      if (esAdminOBiblio) {
        const res = await api.get('/prestamos');
        prestamosData = res.data;
      } else {
        const res = await api.get(`/prestamos/usuario/${usuarioActual?.id}`);
        prestamosData = res.data;
      }
      setPrestamos(prestamosData);

      const lRes = await api.get('/libros');
      setLibros(lRes.data);

      if (esAdminOBiblio) {
        const uRes = await api.get('/usuarios');
        setUsuarios(uRes.data);
      }
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Calcular fecha devolución según rol
  const getFechaDevolucion = (rol: string) => {
    const hoy = new Date();
    let dias = 10; // cliente por defecto
    if (rol === 'PROFESOR') dias = 15;
    if (rol === 'ESTUDIANTE') dias = 10;
    hoy.setDate(hoy.getDate() + dias);
    return hoy.toISOString().split('T')[0];
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usuarioSeleccionado = esAdminOBiblio
        ? usuarios.find(u => u.id === Number(form.usuarioId))
        : usuarioActual;

      const fechaDev = form.fechaDevolucion || getFechaDevolucion(usuarioSeleccionado?.rol ?? 'CLIENTE');

      await api.post('/prestamos', {
        usuarioId: esAdminOBiblio ? Number(form.usuarioId) : usuarioActual?.id,
        libroId: Number(form.libroId),
        fechaDevolucion: fechaDev,
        tipoDocRetenido: form.tipoDocRetenido || undefined,
        observaciones: form.observaciones || undefined,
      });
      setShowModal(false);
      setForm({ usuarioId: '', libroId: '', fechaDevolucion: '', tipoDocRetenido: '', observaciones: '' });
      fetchAll();
    } catch {
      setError('Error al crear préstamo');
    }
  };

  const handleDevolver = async (id: number) => {
    if (!confirm('¿Registrar devolución?')) return;
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

  const estadoBadge = (estado: string) => {
    const map: Record<string, string> = {
      PENDIENTE: 'badge-pending',
      ACTIVO: 'badge-active',
      DEVUELTO: 'badge-done',
      VENCIDO: 'badge-vencido',
    };
    return map[estado] ?? 'badge-user';
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
                {esAdminOBiblio && <th>Usuario</th>}
                <th>Libro</th>
                <th>F. Préstamo</th>
                <th>F. Devolución</th>
                <th>F. Devuelto</th>
                <th>Costo</th>
                <th>Estado</th>
                {esBibliotecario && <th>Doc. Retenido</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prestamos.length === 0 ? (
                <tr><td colSpan={9} className="empty">No hay préstamos</td></tr>
              ) : (
                prestamos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    {esAdminOBiblio && <td>{p.usuario ? `${p.usuario.nombre} ${p.usuario.apellido}` : `#${p.usuarioId}`}</td>}
                    <td>{p.libro?.titulo ?? `Libro #${p.libroId}`}</td>
                    <td>{formatFecha(p.fechaPrestamo)}</td>
                    <td>{formatFecha(p.fechaDevolucion)}</td>
                    <td>{formatFecha(p.fechaDevueltaReal)}</td>
                    <td>${(p.costoPrestamo ?? 0).toFixed(2)}</td>
                    <td><span className={`badge ${estadoBadge(p.estado)}`}>{p.estado}</span></td>
                    {esBibliotecario && <td>{p.tipoDocRetenido ?? '—'}</td>}
                    <td className="actions">
                      {(esAdminOBiblio) && (p.estado === 'ACTIVO' || p.estado === 'PENDIENTE') && (
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
                    {(esProfesor) && (
              <div className="info-box">✅ Préstamo gratuito — $0.00 y sin multa por retraso (Profesor)</div>
            )}
            {(esEstudiante) && (
              <div className="info-box info-yellow">📌 Costo del préstamo: $1.00 (50% descuento). Multa $0.25/día si devuelves tarde (Estudiante)</div>
            )}
            {!esProfesor && !esEstudiante && (
              <div className="info-box info-yellow">⚠️ Costo del préstamo: $2.00. Máximo 10 días. Multa $0.50/día por retraso.</div>
            )}
            <form onSubmit={handleCreate} className="modal-form">
              {esAdminOBiblio && (
                <div className="form-group">
                  <label>Usuario</label>
                  <select value={form.usuarioId} onChange={(e) => setForm({ ...form, usuarioId: e.target.value })} required>
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre} {u.apellido} ({u.rol})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Libro</label>
                <select value={form.libroId} onChange={(e) => setForm({ ...form, libroId: e.target.value })} required>
                  <option value="">Selecciona un libro</option>
                  {libros.filter(l => l.disponibles > 0).map((l) => (
                    <option key={l.id} value={l.id}>{l.titulo} (disponibles: {l.disponibles})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha devolución</label>
                <input
                  type="date"
                  value={form.fechaDevolucion}
                  onChange={(e) => setForm({ ...form, fechaDevolucion: e.target.value })}
                  required
                />
              </div>
              {esBibliotecario && (
                <div className="form-group">
                  <label>Tipo de documento retenido</label>
                  <select value={form.tipoDocRetenido} onChange={(e) => setForm({ ...form, tipoDocRetenido: e.target.value })}>
                    <option value="">Sin documento</option>
                    <option value="Cédula">Cédula</option>
                    <option value="Carnet estudiantil">Carnet estudiantil</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="Licencia">Licencia</option>
                  </select>
                </div>
              )}
              {esAdminOBiblio && (
                <div className="form-group">
                  <label>Observaciones</label>
                  <input value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} placeholder="Opcional" />
                </div>
              )}
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
