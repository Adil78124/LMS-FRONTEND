import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { favoriteService } from '../../services/favoriteService';
import CourseCard from '../../components/CourseCard/CourseCard';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import { IconClose } from '../../components/UI/Icons/Icons';
import './Favorites.css';

const Favorites = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setCourses([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    favoriteService
      .getMyFavorites()
      .then((data) => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleRemove = async (courseId) => {
    try {
      await favoriteService.remove(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="favorites">
        <div className="container">
          <div className="favorites__header">
            <h1 className="favorites__title">{t('favorite.title')}</h1>
            <p className="favorites__subtitle">{t('favorite.subtitle')}</p>
          </div>
          <div className="favorites__auth-required">
            <p>{t('favorite.authRequired')}</p>
            <Link to="/login">
              <Button variant="primary">{t('nav.signIn')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites">
        <div className="container">
          <div className="favorites__loading">
            <Loader />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="container">
        <div className="favorites__header">
          <h1 className="favorites__title">{t('favorite.title')}</h1>
          <p className="favorites__subtitle">{t('favorite.subtitle')}</p>
        </div>

        {courses.length > 0 ? (
          <div className="favorites__grid">
            {courses.map((course) => (
              <div key={course.id} className="favorites__card-wrap">
                <CourseCard
                  course={course}
                  isFavorite={true}
                  onToggleFavorite={async (courseId) => {
                    await handleRemove(courseId);
                  }}
                />
                <button
                  type="button"
                  className="favorites__remove-btn"
                  onClick={() => handleRemove(course.id)}
                  title={t('favorite.removeFromFavorites')}
                >
                  <IconClose size={16} /> {t('favorite.removeFromFavorites')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Card className="favorites__empty">
            <h3 className="favorites__empty-title">{t('favorite.empty')}</h3>
            <p className="favorites__empty-text">{t('favorite.emptyDesc')}</p>
            <Link to="/catalog">
              <Button variant="primary">{t('catalog.title')}</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Favorites;
