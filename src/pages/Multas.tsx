import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Multa {
  id: number;
  usuarioId: number;
  prestamoId: number;
  monto: number;
  pagada: boolean;
  usuario?: { nombre: string };
  prestamo?: { id: number };
}

export default function Multas() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMultas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/multas');
      setMultas(res.data);
    } catch {
      setError('Error al cargar multas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMultas(); }, []);

  const handlePagar = async (id: number) => {
    if (!confirm('¿Marcar multa como pagada?')) return;
    try {
      await api.post(`/multas/${id}/pagar`);
      fetchMultas();
    } catch {
      setError('Error al registrar pago');
    }
  };

  const pendientes = multas.filter((m) => !m.pagada);
  const pagadas = multas.filter((m) => m.pagada);

  return (
    <Layout>
      <div className="page-header">
        <h2>💰 Multas</h2>
        <div className="stats-row">
          <span className="stat-chip red">Pendientes: {pendientes.length}</span>
          <span className="stat-chip green">Pagadas: {pagadas.length}</span>
        </div>
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
                <th>Préstamo #</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {multas.length === 0 ? (
                <tr><td colSpan={6} className="empty">No hay multas registradas</td></tr>
              ) : (
                multas.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.usuario?.nombre || `Usuario #${m.usuarioId}`}</td>
                    <td>{m.prestamoId}</td>
                    <td>${m.monto?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${m.pagada ? 'badge-done' : 'badge-pending'}`}>
                        {m.pagada ? 'Pagada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="actions">
                      {!m.pagada && (
                        <button className="btn-edit" onClick={() => handlePagar(m.id)}>
                          Pagar
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
    </Layout>
  );
}
