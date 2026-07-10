import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmar: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password,
        rol: 'CLIENTE',
      });
      navigate('/login', { state: { registered: true } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Error al registrarse. El email puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        <div className="login-header">
          <span className="login-icon">📚</span>
          <h1>Biblioteca</h1>
          <p>Crear cuenta nueva</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Diego"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                type="text"
                value={form.apellido}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                placeholder="Cabrera"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <input
              id="confirmar"
              type="password"
              value={form.confirmar}
              onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
              placeholder="Repite tu contraseña"
              required
            />
          </div>
          <p className="register-note">Tu cuenta será creada con rol de <strong>Cliente</strong>.</p>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
          <p className="register-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
