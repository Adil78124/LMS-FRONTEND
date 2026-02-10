import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTeacherRole } from '../../utils/roles';
import Button from '../../components/UI/Button/Button';
import './Auth.css';

const Login = () => {
  const { t } = useLanguage();
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    try {
      const data = await login(email, password);
      const from = location.state?.from;
      if (from && (from.startsWith('/teaching') || from === '/')) {
        navigate(from, { replace: true });
        return;
      }
      if (isTeacherRole(data?.user?.role)) {
        navigate('/teaching', { replace: true });
      } else {
        navigate(from || '/catalog', { replace: true });
      }
    } catch {
      // error уже в AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth__title">{t('auth.login')}</h1>
          <p className="auth__subtitle">
            {t('auth.hasAccount')} {t('auth.login')}
          </p>

          <form className="auth__form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth__error" role="alert">
                {error}
              </div>
            )}

            <div className="auth__field">
              <label htmlFor="email" className="auth__label">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                className="auth__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth__field">
              <label htmlFor="password" className="auth__label">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                className="auth__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                autoComplete="current-password"
              />
              <span className="auth__hint">{t('auth.passwordMinLength')}</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {t('auth.submitLogin')}
            </Button>
          </form>

          <p className="auth__footer">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="auth__link">
              {t('auth.signUpLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
