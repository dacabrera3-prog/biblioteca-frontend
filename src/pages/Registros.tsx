import { useEffect, useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

interface Registro {
  id: number;
  usuarioId: number | null;
  accion: string;
  entidad: string;
  entidadId: number | null;
  detalle: string | null;
  ip: string | null;
  creadoEn: string;
  usuario?: { nombre: string; apellido: string };
}

export default function Registros() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      try {
        const res = await api.get('/registros');
        setRegistros(res.data);
      } catch {
        setError('Error al cargar registros');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistros();
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h2>📋 Registros de Auditoría</h2>
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
                <th>Acción</th>
                <th>Entidad</th>
                <th>ID Entidad</th>
                <th>Detalle</th>
                <th>IP</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr><td colSpan={8} className="empty">No hay registros</td></tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : `#${r.usuarioId ?? '—'}`}</td>
                    <td><span className="badge badge-active">{r.accion}</span></td>
                    <td>{r.entidad}</td>
                    <td>{r.entidadId ?? '—'}</td>
                    <td>{r.detalle ?? '—'}</td>
                    <td>{r.ip ?? '—'}</td>
                    <td>{new Date(r.creadoEn).toLocaleString('es-ES')}</td>
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
