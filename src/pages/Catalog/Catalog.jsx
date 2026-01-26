import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ProgressContext';
import { mockCourses } from '../../data/mockData';
import { categories } from '../../data/categories';
import CourseCard from '../../components/CourseCard/CourseCard';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import './Catalog.css';

const Catalog = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  // Определяем, находимся ли мы на странице "Мои курсы"
  const isMyCourses = location.pathname === '/my-courses';
  
  // Преобразуем slug категории в ID, если передан slug
  const getCategoryIdFromSlug = (slug) => {
    if (!slug) return 'all';
    const category = categories.find(cat => cat.slug === slug);
    return category ? String(category.id) : slug;
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl ? getCategoryIdFromSlug(categoryFromUrl) : 'all'
  );
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const filteredCourses = useMemo(() => {
    let filtered = [...mockCourses];

    // Если это "Мои курсы", показываем только курсы с прогрессом (купленные или начатые)
    if (isMyCourses) {
      filtered = filtered.filter((course) => {
        const courseProgress = progress[course.id];
        return courseProgress && (
          courseProgress.completedLessons > 0 || 
          Object.keys(courseProgress.lessons || {}).length > 0
        );
      });
    }

    // Поиск
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.author.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)
      );
    }

    // Категория
    if (selectedCategory !== 'all') {
      const categorySlug = categories.find(cat => String(cat.id) === selectedCategory)?.slug;
      if (categorySlug) {
        // Фильтруем по slug категории, сравнивая с названием категории в курсе
        filtered = filtered.filter((course) => {
          const courseCategorySlug = categories.find(cat => cat.name === course.category)?.slug;
          return courseCategorySlug === categorySlug || course.categoryId === parseInt(selectedCategory);
        });
      } else {
        filtered = filtered.filter((course) => course.categoryId === parseInt(selectedCategory));
      }
    }

    // Уровень
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Цена
    if (priceFilter === 'free') {
      filtered = filtered.filter((course) => course.currentPrice === 0);
    } else if (priceFilter === 'paid') {
      filtered = filtered.filter((course) => course.currentPrice > 0);
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedLevel, priceFilter, isMyCourses, progress]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      setSearchParams({});
    } else {
      // Сохраняем slug категории в URL для читаемости
      const category = categories.find(cat => String(cat.id) === categoryId);
      const categorySlug = category ? category.slug : categoryId;
      setSearchParams({ category: categorySlug });
    }
  };

  // Обновляем selectedCategory при изменении URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      const categoryId = getCategoryIdFromSlug(categoryFromUrl);
      setSelectedCategory(categoryId);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams]);

  return (
    <div className="catalog">
      <div className="container">
        <div className="catalog__header">
          <h1 className="catalog__title">
            {isMyCourses ? t('nav.myCourses') : t('catalog.title')}
          </h1>
          <p className="catalog__subtitle">
            {isMyCourses ? t('catalog.myCoursesSubtitle') : t('catalog.subtitle')}
          </p>
        </div>

        <div className="catalog__layout">
          {/* Filters Sidebar */}
          <aside className="catalog__filters">
            <Card className="catalog__filters-card">
              <h3 className="catalog__filters-title">{t('catalog.filters')}</h3>

              {/* Search */}
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

              {/* Category */}
              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('catalog.category')}</label>
                <div className="catalog__filter-options">
                  <button
                    className={`catalog__filter-option ${
                      selectedCategory === 'all' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => handleCategoryChange('all')}
                  >
                    {t('catalog.all')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`catalog__filter-option ${
                        selectedCategory === String(category.id)
                          ? 'catalog__filter-option--active'
                          : ''
                      }`}
                      onClick={() => handleCategoryChange(String(category.id))}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('catalog.level')}</label>
                <div className="catalog__filter-options">
                  <button
                    className={`catalog__filter-option ${
                      selectedLevel === 'all' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setSelectedLevel('all')}
                  >
                    {t('catalog.all')}
                  </button>
                  <button
                    className={`catalog__filter-option ${
                      selectedLevel === 'beginner' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setSelectedLevel('beginner')}
                  >
                    {t('catalog.beginner')}
                  </button>
                  <button
                    className={`catalog__filter-option ${
                      selectedLevel === 'intermediate' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setSelectedLevel('intermediate')}
                  >
                    {t('catalog.intermediate')}
                  </button>
                  <button
                    className={`catalog__filter-option ${
                      selectedLevel === 'advanced' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setSelectedLevel('advanced')}
                  >
                    {t('catalog.advanced')}
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="catalog__filter-group">
                <label className="catalog__filter-label">{t('catalog.price')}</label>
                <div className="catalog__filter-options">
                  <button
                    className={`catalog__filter-option ${
                      priceFilter === 'all' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setPriceFilter('all')}
                  >
                    {t('catalog.all')}
                  </button>
                  <button
                    className={`catalog__filter-option ${
                      priceFilter === 'free' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setPriceFilter('free')}
                  >
                    {t('catalog.free')}
                  </button>
                  <button
                    className={`catalog__filter-option ${
                      priceFilter === 'paid' ? 'catalog__filter-option--active' : ''
                    }`}
                    onClick={() => setPriceFilter('paid')}
                  >
                    {t('catalog.paid')}
                  </button>
                </div>
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                size="sm"
                fullWidth
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
            </Card>
          </aside>

          {/* Courses Grid */}
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
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="catalog__empty">
                  <div className="catalog__empty-icon">🔍</div>
                  <h3 className="catalog__empty-title">{t('catalog.noCourses')}</h3>
                  <p className="catalog__empty-text">
                    {t('catalog.tryChangeFilters')}
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
