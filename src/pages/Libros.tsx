import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Libro {
  id: number;
  titulo: string;
  autor: string;
  isbn: string;
  cantidad: number;
  disponibles?: number;
}

const emptyForm: Omit<Libro, 'id'> = { titulo: '', autor: '', isbn: '', cantidad: 1 };

export default function Libros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [buscar, setBuscar] = useState('');
  const [form, setForm] = useState<Omit<Libro, 'id'>>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLibros = async (q = '') => {
    setLoading(true);
    try {
      const url = q ? `/libros?buscar=${q}` : '/libros';
      const res = await api.get(url);
      setLibros(res.data);
    } catch {
      setError('Error al cargar libros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLibros(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLibros(buscar);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (libro: Libro) => {
    setForm({ titulo: libro.titulo, autor: libro.autor, isbn: libro.isbn, cantidad: libro.cantidad });
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
        <button className="btn-primary" onClick={openCreate}>+ Nuevo libro</button>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Buscar por título o autor..."
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
                <th>ISBN</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {libros.length === 0 ? (
                <tr><td colSpan={6} className="empty">No hay libros</td></tr>
              ) : (
                libros.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.titulo}</td>
                    <td>{l.autor}</td>
                    <td>{l.isbn}</td>
                    <td>{l.cantidad}</td>
                    <td className="actions">
                      <button className="btn-edit" onClick={() => openEdit(l)}>Editar</button>
                      <button className="btn-delete" onClick={() => handleDelete(l.id)}>Eliminar</button>
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
                <label>ISBN</label>
                <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Cantidad</label>
                <input type="number" min={1} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} required />
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
