import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { isTeacherRole } from '../../utils/roles';
import Button from '../../components/UI/Button/Button';
import RoleSelector from '../../components/RoleSelector/RoleSelector';
import './Auth.css';

const Register = () => {
  const { t } = useLanguage();
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleContinue = () => {
    if (form.role) setStep(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationError('');
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (form.password.length < 8) {
      setValidationError(t('auth.passwordMinLength'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setValidationError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (isTeacherRole(data?.user?.role)) {
        navigate('/teaching', { replace: true });
      } else {
        navigate('/catalog', { replace: true });
      }
    } catch {
      // error уже в AuthContext
    } finally {
      setLoading(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="auth-page auth-page--register">
      <div className={`auth-container ${step === 2 ? 'auth-container--form' : ''}`}>
        {step === 1 ? (
          <>
            <RoleSelector selectedRole={form.role} onSelect={handleRoleSelect} />
            <div className="auth-page__continue">
              <Button
                variant="primary"
                size="lg"
                onClick={handleContinue}
              >
                {t('common.next')}
              </Button>
            </div>
          </>
        ) : (
          <div className="auth-card auth-card--slide">
            <button
              type="button"
              className="auth__back"
              onClick={() => setStep(1)}
            >
              ← {t('common.back')}
            </button>
            <h1 className="auth__title">{t('auth.register')}</h1>
            <p className="auth__subtitle">
              {t('auth.role')}: {t(form.role === 'schoolkid' ? 'auth.roleSchoolkid' : form.role === 'student' ? 'auth.roleStudent' : 'auth.roleTeacher')}
            </p>

            <form className="auth__form" onSubmit={handleSubmit}>
              {displayError && (
                <div className="auth__error" role="alert">
                  {displayError}
                </div>
              )}

              <div className="auth__field">
                <label htmlFor="fullname" className="auth__label">
                  {t('auth.fullname')}
                </label>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  className="auth__input"
                  value={form.fullname}
                  onChange={handleChange}
                  placeholder="Иван Иванов"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="auth__field">
                <label htmlFor="email" className="auth__label">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth__input"
                  value={form.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  className="auth__input"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <span className="auth__hint">{t('auth.passwordMinLength')}</span>
              </div>

              <div className="auth__field">
                <label htmlFor="confirmPassword" className="auth__label">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="auth__input"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {t('auth.submitRegister')}
              </Button>
            </form>

            <p className="auth__footer">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="auth__link">
                {t('auth.signInLink')}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
