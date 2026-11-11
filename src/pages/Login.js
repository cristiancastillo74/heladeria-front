import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) {
      const responseMessage = requestError.response?.data;
      setError(typeof responseMessage === 'string'
        ? responseMessage
        : 'No se pudo iniciar sesión. Revisa tus credenciales o la conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Inicio de sesión">
        <div className="login-brand">
          <span className="login-brand-mark" aria-hidden="true">H</span>
          <div>
            <p className="login-eyebrow">HELADERÍA</p>
            <h1>Bienvenido</h1>
            <p className="login-brand-note">Sabor de casa, todos los días.</p>
          </div>
          <span className="login-brand-rule" aria-hidden="true" />
          <p className="login-brand-footer">Acceso al sistema</p>
        </div>

        <div className="login-form-panel">
          <div className="login-form-heading">
            <p className="login-eyebrow">INICIAR SESIÓN</p>
            <h2>Entra a tu cuenta</h2>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoFocus
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p className="login-error" role="alert">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}