import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { isTeacherRole } from '../../utils/roles';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { favoriteService } from '../../services/favoriteService';
import { enrollmentService } from '../../services/enrollmentService';
import CourseCard from '../../components/CourseCard/CourseCard';
import CategoryIcon from '../../components/CategoryIcon/CategoryIcon';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import './Home.css';

const Home = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [myEnrollments, setMyEnrollments] = useState([]);

  if (!authLoading && isTeacherRole(user?.role)) {
    return <Navigate to="/teaching" replace />;
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([courseService.getAll(), categoryService.getAll()])
      .then(([coursesData, cats]) => {
        if (cancelled) return;
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {
        if (!cancelled) setCourses([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      setMyEnrollments([]);
      return;
    }
    let cancelled = false;
    Promise.all([
      favoriteService.getMyFavorites(),
      enrollmentService.getMyEnrollments().catch(() => []),
    ]).then(([favList, enrollList]) => {
      if (cancelled) return;
      setFavoriteIds(Array.isArray(favList) ? new Set(favList.map((c) => c.id)) : new Set());
      setMyEnrollments(Array.isArray(enrollList) ? enrollList.slice(0, 6) : []);
    });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleToggleFavorite = async (courseId) => {
    if (!isAuthenticated) return;
    const inFav = favoriteIds.has(courseId);
    try {
      if (inFav) {
        await favoriteService.remove(courseId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      } else {
        await favoriteService.add(courseId);
        setFavoriteIds((prev) => new Set([...prev, courseId]));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const popularCourses = [...courses].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6);
  const newCourses = [...courses]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 4);
  const totalStudents = courses.reduce((acc, c) => acc + (c.studentsCount || 0), 0);

  if (loading) {
    return (
      <div className="home">
        <div className="container">
          <div className="home__loading">
            <Loader />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="home__hero">
        <div className="container">
          <div className="home__hero-content">
            <h1 className="home__hero-title">{t('home.title')}</h1>
            <p className="home__hero-subtitle">{t('home.subtitle')}</p>
            <div className="home__hero-actions">
              <Link to="/catalog">
                <Button variant="primary" size="lg">
                  {t('home.ctaButton')}
                </Button>
              </Link>
              <Link to="/catalog">
                <Button variant="outline" size="lg">
                  {t('catalog.title')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="home__hero-image">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=85"
              alt=""
              className="home__hero-img"
            />
          </div>
        </div>
        <div className="home__hero-stats">
          <div className="home__stat">
            <span className="home__stat-value">{courses.length}</span>
            <span className="home__stat-label">{t('home.statsCourses')}</span>
          </div>
          <div className="home__stat">
            <span className="home__stat-value">{totalStudents}+</span>
            <span className="home__stat-label">{t('home.statsStudents')}</span>
          </div>
          <div className="home__stat">
            <span className="home__stat-value">{categories.length}</span>
            <span className="home__stat-label">{t('home.statsCategories')}</span>
          </div>
        </div>
      </section>

      {isAuthenticated && myEnrollments.length > 0 && (
        <section className="home__section page-section page-section--alt">
          <div className="container">
            <div className="home__section-header">
              <h2 className="home__section-title">{t('home.continueLearning')}</h2>
              <Link to="/my-courses" className="home__section-link">{t('home.viewAll')} →</Link>
            </div>
            <div className="home__courses-grid">
              {myEnrollments.slice(0, 3).map((item) => (
                <CourseCard
                  key={item.id}
                  course={item}
                  enrollmentProgress={item.enrollment?.progressPercent}
                  isEnrolled
                  isFavorite={favoriteIds.has(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {popularCourses.length > 0 && (
        <section className="home__section page-section">
          <div className="container">
            <div className="home__section-header">
              <h2 className="home__section-title">{t('home.popularCourses')}</h2>
              <Link to="/catalog" className="home__section-link">
                {t('home.viewAll')} →
              </Link>
            </div>
            <div className="home__courses-grid">
              {popularCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={favoriteIds.has(course.id)}
                  onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {newCourses.length > 0 && (
        <section className="home__section page-section page-section--alt">
          <div className="container">
            <div className="home__section-header">
              <h2 className="home__section-title">{t('home.newCourses')}</h2>
              <Link to="/catalog" className="home__section-link">
                {t('home.viewAll')} →
              </Link>
            </div>
            <div className="home__courses-grid">
              {newCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isFavorite={favoriteIds.has(course.id)}
                  onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="home__section home__section--categories page-section">
          <div className="container">
            <div className="home__section-header">
              <h2 className="home__section-title">{t('home.categories')}</h2>
            </div>
            <div className="home__categories">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.slug}`}
                  className="home__category"
                >
                  <CategoryIcon slug={cat.slug} className="home__category-icon" size={48} />
                  <span className="home__category-name">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
