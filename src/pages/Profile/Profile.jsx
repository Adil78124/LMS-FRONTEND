import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentService } from '../../services/enrollmentService';
import { authService } from '../../services/authService';
import { API_BASE_URL } from '../../config/api';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import './Profile.css';

const Profile = () => {
  const { t, language } = useLanguage();
  const { user, setUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null;
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl;
    return `${API_BASE_URL || ''}${user.avatarUrl}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const data = await authService.uploadAvatar(file);
      if (data.user) setUser(data.user);
    } catch (err) {
      setAvatarError(err.message || 'Не удалось загрузить фото');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    enrollmentService
      .getMyEnrollments()
      .then((data) => {
        if (!cancelled) setEnrollments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setEnrollments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="profile profile--loading">
        <div className="container">
          <Loader />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile">
        <div className="container">
          <div className="profile__auth-required">
            <h2>{t('profile.authRequired')}</h2>
            <p>{t('profile.authRequiredDesc')}</p>
            <div className="profile__auth-actions">
              <Button variant="primary" onClick={() => navigate('/login')}>
                {t('nav.signIn')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/register')}>
                {t('nav.signUp')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const inProgressCourses = enrollments.filter(
    (c) => (c.enrollment?.progressPercent ?? 0) > 0 && (c.enrollment?.progressPercent ?? 0) < 100
  );
  const completedCourses = enrollments.filter((c) => (c.enrollment?.progressPercent ?? 0) >= 100);

  const totalLessons = enrollments.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const completedLessons = enrollments.reduce((sum, c) => {
    const p = c.enrollment?.progressPercent ?? 0;
    const total = c.lessons?.length || 1;
    return sum + Math.round((p / 100) * total);
  }, 0);

  return (
    <div className="profile">
      <div className="container">
        <h1 className="profile__title">{t('profile.title')}</h1>

        <div className="profile__layout">
          <aside className="profile__sidebar">
            <Card className="profile__card">
              <div className="profile__avatar-wrap">
                <input
                  ref={avatarInputRef}
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                  className="profile__avatar-input"
                />
                <div className="profile__avatar">
                  {getAvatarUrl() ? (
                    <img src={getAvatarUrl()} alt="" className="profile__avatar-img" />
                  ) : (
                    <span>
                      {user?.fullname?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        'U'}
                    </span>
                  )}
                </div>
                <label htmlFor="profile-avatar" className="profile__avatar-edit">
                  {avatarUploading ? t('common.loading') : t('profile.changePhoto')}
                </label>
                {avatarError && <p className="profile__avatar-error" role="alert">{avatarError}</p>}
              </div>
              <h2 className="profile__name">{user?.fullname || t('profile.user')}</h2>
              <p className="profile__email">{user?.email}</p>
              {user?.role && <p className="profile__role">{user.role}</p>}
              {user?.createdAt && (
                <p className="profile__registered">
                  {t('profile.registeredAt')}{' '}
                  {new Date(user.createdAt).toLocaleDateString(
                    { ru: 'ru-RU', en: 'en-US', kz: 'kk-KZ' }[language] || 'ru-RU',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  )}
                </p>
              )}
            </Card>

            <Card className="profile__card">
              <h3 className="profile__card-title">{t('profile.statistics')}</h3>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.totalLessons')}</span>
                <span className="profile__stat-value">{totalLessons}</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.completedLessons')}</span>
                <span className="profile__stat-value">{completedLessons}</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.completedCourses')}</span>
                <span className="profile__stat-value">{completedCourses.length}</span>
              </div>
              <div className="profile__stat">
                <span className="profile__stat-label">{t('profile.inProgress')}</span>
                <span className="profile__stat-value">{inProgressCourses.length}</span>
              </div>
            </Card>
          </aside>

          <main className="profile__main">
            {loading ? (
              <div className="profile__loading">
                <Loader />
              </div>
            ) : (
              <>
                {inProgressCourses.length > 0 && (
                  <section className="profile__section">
                    <h2 className="profile__section-title">{t('profile.inProgress')}</h2>
                    <div className="profile__courses">
                      {inProgressCourses.map((course) => (
                        <Link key={course.id} to={`/course/${course.id}`} className="profile__course">
                          <Card hoverable>
                            <div className="profile__course-header">
                              <h3>{course.title}</h3>
                              <span className="profile__course-progress">
                                {course.enrollment?.progressPercent ?? 0}%
                              </span>
                            </div>
                            <div className="profile__course-progress-bar">
                              <div
                                className="profile__course-progress-fill"
                                style={{
                                  width: `${course.enrollment?.progressPercent ?? 0}%`,
                                }}
                              />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {completedCourses.length > 0 && (
                  <section className="profile__section">
                    <h2 className="profile__section-title">{t('profile.completedCourses')}</h2>
                    <div className="profile__courses">
                      {completedCourses.map((course) => (
                        <Link key={course.id} to={`/course/${course.id}`} className="profile__course">
                          <Card hoverable>
                            <div className="profile__course-header">
                              <h3>{course.title}</h3>
                              <span className="profile__course-completed">
                                ✅ {t('profile.completed')}
                              </span>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {!loading && inProgressCourses.length === 0 && completedCourses.length === 0 && (
                  <section className="profile__section">
                    <p className="profile__empty">{t('catalog.noMyCourses')}</p>
                    <Link to="/catalog">
                      <Button variant="primary">{t('catalog.title')}</Button>
                    </Link>
                  </section>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
