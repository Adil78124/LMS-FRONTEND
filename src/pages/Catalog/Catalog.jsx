import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { enrollmentService } from '../../services/enrollmentService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';
import CourseCard from '../../components/CourseCard/CourseCard';
import CategoryIcon from '../../components/CategoryIcon/CategoryIcon';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import { IconSearch } from '../../components/UI/Icons/Icons';
import './Catalog.css';

const Catalog = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const isMyCourses = location.pathname === '/my-courses';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const scrollRestoreRef = useRef(null);

  useEffect(() => {
    if (isMyCourses && !isAuthenticated) {
      setCourses([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [cats, coursesData] = await Promise.all([
          categoryService.getAll(),
          isMyCourses ? enrollmentService.getMyEnrollments() : courseService.getAll(),
        ]);

        if (cancelled) return;

        setCategories(Array.isArray(cats) ? cats : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [isMyCourses, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    favoriteService
      .getMyFavorites()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setFavoriteIds(new Set(list.map((c) => c.id)));
      })
      .catch(() => {
        if (!cancelled) setFavoriteIds(new Set());
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

  const filteredCourses = useMemo(() => {
    let list = [...courses];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.author || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => String(c.id) === selectedCategory || c.slug === selectedCategory);
      if (cat) {
        list = list.filter((c) => c.categoryId === cat.id || c.categorySlug === cat.slug || c.category === cat.name);
      }
    }

    if (selectedLevel !== 'all') {
      list = list.filter((c) => c.level === selectedLevel);
    }

    if (priceFilter === 'free') {
      list = list.filter((c) => (c.currentPrice ?? c.price ?? 0) === 0);
    } else if (priceFilter === 'paid') {
      list = list.filter((c) => (c.currentPrice ?? c.price ?? 0) > 0);
    }

    return list;
  }, [courses, searchQuery, selectedCategory, selectedLevel, priceFilter, categories]);

  const handleCategoryChange = (categoryId) => {
    scrollRestoreRef.current = window.scrollY;
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      const cat = categories.find((c) => String(c.id) === categoryId);
      setSearchParams({ category: cat?.slug || categoryId }, { replace: true });
    }
  };

  const handleLevelChange = (level) => {
    scrollRestoreRef.current = window.scrollY;
    setSelectedLevel(level);
  };

  const handlePriceChange = (price) => {
    scrollRestoreRef.current = window.scrollY;
    setPriceFilter(price);
  };

  useEffect(() => {
    const y = scrollRestoreRef.current;
    if (y !== null && y !== undefined) {
      scrollRestoreRef.current = null;
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0, behavior: 'auto' });
      });
    }
  }, [selectedCategory, selectedLevel, priceFilter]);

  useEffect(() => {
    if (categoryFromUrl) {
      const cat = categories.find((c) => c.slug === categoryFromUrl);
      setSelectedCategory(cat ? String(cat.id) : categoryFromUrl);
    } else {
      setSelectedCategory('all');
    }
  }, [categoryFromUrl, categories]);

  if (isMyCourses && !isAuthenticated) {
    return (
      <div className="catalog">
        <header className="catalog__hero">
          <div className="catalog__hero-bg" aria-hidden="true" />
          <div className="container catalog__hero-inner">
            <div className="catalog__hero-content">
              <h1 className="catalog__hero-title">{t('nav.myCourses')}</h1>
              <p className="catalog__hero-subtitle">{t('catalog.myCoursesSubtitle')}</p>
            </div>
          </div>
        </header>
        <div className="container">
          <div className="catalog__auth-required">
            <p>{t('profile.authRequiredDesc')}</p>
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
      <div className="catalog">
        <div className="container">
          <div className="catalog__loading">
            <Loader />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog">
        <div className="container">
          <div className="catalog__error">
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              {t('common.retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog">
      <header className="catalog__hero">
        <div className="catalog__hero-bg" aria-hidden="true" />
        <div className="container catalog__hero-inner">
          <div className="catalog__hero-content">
            <h1 className="catalog__hero-title">
              {isMyCourses ? t('nav.myCourses') : t('catalog.title')}
            </h1>
            <p className="catalog__hero-subtitle">
              {isMyCourses ? t('catalog.myCoursesSubtitle') : t('catalog.subtitle')}
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="catalog__layout">
          <aside className="catalog__filters">
            <Card className="catalog__filters-card">
              <h3 className="catalog__filters-title">{t('catalog.filters')}</h3>

              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('common.search')}</label>
                <input
                  type="text"
                  className="catalog__search-input"
                  placeholder={t('catalog.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('catalog.category')}</label>
                <div className="catalog__filter-options">
                  <button
                    type="button"
                    className={`catalog__filter-option ${selectedCategory === 'all' ? 'catalog__filter-option--active' : ''}`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    {t('catalog.all')}
                  </button>
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      className={`catalog__filter-option ${
                        selectedCategory === String(cat.id) || selectedCategory === cat.slug
                          ? 'catalog__filter-option--active'
                          : ''
                      }`}
                      onClick={() => handleCategoryChange(String(cat.id))}
                    >
                      <CategoryIcon slug={cat.slug} size={20} /> {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('catalog.level')}</label>
                <div className="catalog__filter-options">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      className={`catalog__filter-option ${selectedLevel === lvl ? 'catalog__filter-option--active' : ''}`}
                      onClick={() => handleLevelChange(lvl)}
                    >
                      {lvl === 'all' ? t('catalog.all') : t(`catalog.${lvl}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('catalog.price')}</label>
                <div className="catalog__filter-options">
                  {['all', 'free', 'paid'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      className={`catalog__filter-option ${priceFilter === p ? 'catalog__filter-option--active' : ''}`}
                      onClick={() => handlePriceChange(p)}
                    >
                      {t(`catalog.${p}`)}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  scrollRestoreRef.current = window.scrollY;
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setPriceFilter('all');
                  setSearchParams({}, { replace: true });
                }}
              >
                {t('catalog.resetFilters')}
              </Button>
            </Card>
          </aside>

          <main className="catalog__main">
            <div className="catalog__results">
              <div className="catalog__results-header">
                <p className="catalog__results-count">
                  {t('catalog.foundCourses')}: {filteredCourses.length}
                </p>
              </div>

              {filteredCourses.length > 0 ? (
                <div className="catalog__courses-grid">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrollmentProgress={course.enrollment?.progressPercent}
                      isEnrolled={isMyCourses ? !!course.enrollment : undefined}
                      isFavorite={favoriteIds.has(course.id)}
                      onToggleFavorite={isAuthenticated ? handleToggleFavorite : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="catalog__empty">
                  <div className="catalog__empty-icon" aria-hidden><IconSearch size={40} /></div>
                  <h3 className="catalog__empty-title">{t('catalog.noCourses')}</h3>
                  <p className="catalog__empty-text">
                    {isMyCourses && isAuthenticated
                      ? t('catalog.noMyCourses')
                      : t('catalog.tryChangeFilters')}
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                      setPriceFilter('all');
                      setSearchParams({});
                    }}
                  >
                    {t('catalog.resetFilters')}
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
