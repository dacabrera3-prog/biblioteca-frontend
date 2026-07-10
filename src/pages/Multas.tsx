import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface Multa {
  id: number;
  usuarioId: number;
  prestamoId: number;
  monto: number;
  diasRetraso: number;
  estado: string;
  usuario?: { nombre: string; apellido: string };
  prestamo?: { id: number };
}

export default function Multas() {
  const { hasRole, usuario: usuarioActual } = useAuth();
  const esAdminOBiblio = hasRole('ADMINISTRADOR', 'SUBADMINISTRADOR', 'BIBLIOTECARIO');

  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMultas = async () => {
    setLoading(true);
    try {
      let data;
      if (esAdminOBiblio) {
        const res = await api.get('/multas');
        data = res.data;
      } else {
        const res = await api.get(`/multas/usuario/${usuarioActual?.id}`);
        data = res.data;
      }
      setMultas(data);
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

  const pendientes = multas.filter((m) => m.estado === 'PENDIENTE');
  const pagadas = multas.filter((m) => m.estado === 'PAGADA');

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
                {esAdminOBiblio && <th>Usuario</th>}
                <th>Préstamo #</th>
                <th>Días retraso</th>
                <th>Monto</th>
                <th>Estado</th>
                {esAdminOBiblio && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {multas.length === 0 ? (
                <tr><td colSpan={7} className="empty">No hay multas registradas</td></tr>
              ) : (
                multas.map((m) => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    {esAdminOBiblio && <td>{m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : `#${m.usuarioId}`}</td>}
                    <td>{m.prestamoId}</td>
                    <td>{m.diasRetraso}</td>
                    <td>${m.monto?.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${m.estado === 'PAGADA' ? 'badge-done' : 'badge-pending'}`}>
                        {m.estado}
                      </span>
                    </td>
                    {esAdminOBiblio && (
                      <td className="actions">
                        {m.estado === 'PENDIENTE' && (
                          <button className="btn-edit" onClick={() => handlePagar(m.id)}>
                            Pagar
                          </button>
                        )}
                      </td>
                    )}
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
