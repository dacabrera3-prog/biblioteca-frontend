import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  editorial: string;
  anio: number;
  isbn?: string;
  stock: number;
  disponibles: number;
}

const emptyForm = { titulo: '', autor: '', editorial: '', anio: new Date().getFullYear(), isbn: '', stock: 1 };

export default function Libros() {
  const { hasRole, usuario } = useAuth();
  const puedeGestionar = hasRole('BIBLIOTECARIO');

  // Costo estimado según rol
  const mostrarCosto = !puedeGestionar && !!usuario;

  const [libros, setLibros] = useState<Libro[]>([]);
  const [todosLosLibros, setTodosLosLibros] = useState<Libro[]>([]);
  const [buscar, setBuscar] = useState('');
  const [filtroAnio, setFiltroAnio] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLibros = async (q = '') => {
    setLoading(true);
    try {
      const url = q ? `/libros?buscar=${q}` : '/libros';
      const res = await api.get(url);
      setTodosLosLibros(res.data);
      setLibros(res.data);
    } catch {
      setError('Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por año en el frontend
  useEffect(() => {
    if (filtroAnio.trim() === '') {
      setLibros(todosLosLibros);
    } else {
      setLibros(todosLosLibros.filter(l => String(l.anio).includes(filtroAnio.trim())));
    }
  }, [filtroAnio, todosLosLibros]);

  useEffect(() => { fetchLibros(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buscar.trim()) {
      fetchLibros();
      return;
    }
    // Siempre traer todos y filtrar en frontend por múltiples términos
    const terminos = buscar.split(/[,\s]+/).map(t => t.trim().toLowerCase()).filter(t => t);
    setLoading(true);
    try {
      const res = await api.get('/libros');
      const todos: Libro[] = res.data;
      const filtrados = todos.filter(l =>
        terminos.every(t =>
          l.titulo.toLowerCase().includes(t) ||
          l.autor.toLowerCase().includes(t) ||
          l.editorial.toLowerCase().includes(t) ||
          String(l.anio).includes(t)
        )
      );
      setTodosLosLibros(filtrados);
      setLibros(filtrados);
    } catch {
      setError('Error al buscar libros');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (libro: Libro) => {
    setForm({ titulo: libro.titulo, autor: libro.autor, editorial: libro.editorial, anio: libro.anio, isbn: libro.isbn ?? '', stock: libro.stock });
    setEditId(libro.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/libros/${editId}`, form);
      } else {
        await api.post('/libros', form);
      }
      setShowModal(false);
      fetchLibros();
    } catch {
      setError('Error al guardar el libro');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este libro?')) return;
    try {
      await api.delete(`/libros/${id}`);
      fetchLibros();
    } catch {
      setError('Error al eliminar');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h2>📖 Libros</h2>
        {puedeGestionar && (
          <button className="btn-primary" onClick={openCreate}>+ Nuevo libro</button>
        )}
      </div>

      {mostrarCosto && (
        <div className={`info-box ${hasRole('PROFESOR') ? '' : 'info-yellow'}`} style={{ marginBottom: '16px' }}>
          {hasRole('PROFESOR') && '✅ Préstamos gratuitos para ti'}
          {hasRole('ESTUDIANTE') && '📌 Costo por préstamo: $1.00 (50% descuento aplicado)'}
          {!hasRole('PROFESOR') && !hasRole('ESTUDIANTE') && '⚠️ Costo por préstamo: $2.00 — máximo 10 días'}
        </div>
      )}

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Buscar por título, autor, editorial..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <button type="submit" className="btn-secondary">Buscar</button>
        {buscar && (
          <button type="button" className="btn-ghost" onClick={() => { setBuscar(''); fetchLibros(); }}>
            Limpiar
          </button>
        )}
      </form>
      <div className="search-bar" style={{ marginTop: '-10px' }}>
        <input
          type="number"
          placeholder="Filtrar por año (ej: 1997)"
          value={filtroAnio}
          onChange={(e) => setFiltroAnio(e.target.value)}
          style={{ maxWidth: '220px' }}
        />
        {filtroAnio && (
          <button type="button" className="btn-ghost" onClick={() => setFiltroAnio('')}>
            Limpiar año
          </button>
        )}
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
                <th>Título</th>
                <th>Autor</th>
                <th>Editorial</th>
                <th>Año</th>
                <th>ISBN</th>
                <th>Stock</th>
                <th>Disponibles</th>
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {libros.length === 0 ? (
                <tr><td colSpan={puedeGestionar ? 9 : 8} className="empty">No hay libros</td></tr>
              ) : (
                libros.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.titulo}</td>
                    <td>{l.autor}</td>
                    <td>{l.editorial}</td>
                    <td>{l.anio}</td>
                    <td>{l.isbn ?? '—'}</td>
                    <td>{l.stock}</td>
                    <td>
                      <span className={`badge ${l.disponibles > 0 ? 'badge-active' : 'badge-pending'}`}>
                        {l.disponibles}
                      </span>
                    </td>
                    {puedeGestionar && (
                      <td className="actions">
                        <button className="btn-edit" onClick={() => openEdit(l)}>Editar</button>
                        <button className="btn-delete" onClick={() => handleDelete(l.id)}>Eliminar</button>
                      </td>
                    )}
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
            <h3>{editId ? 'Editar libro' : 'Nuevo libro'}</h3>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Título</label>
                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Autor</label>
                <input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Editorial</label>
                <input value={form.editorial} onChange={(e) => setForm({ ...form, editorial: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Año</label>
                <input type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>ISBN (opcional)</label>
                <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input type="number" min={1} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
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
