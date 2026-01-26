import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockCourses } from '../../data/mockData';
import CourseCard from '../../components/CourseCard/CourseCard';
import Button from '../../components/UI/Button/Button';
import './Home.css';

const Home = () => {
  const { t } = useLanguage();

  // Получаем популярные курсы (первые 6)
  const popularCourses = mockCourses.slice(0, 6);
  const newCourses = mockCourses.slice(0, 4);

  return (
    <div className="home">
      {/* Hero Section */}
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
            <div className="home__hero-placeholder">
              <span className="home__hero-icon">📚</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <h2 className="home__section-title">{t('home.popularCourses')}</h2>
            <Link to="/catalog" className="home__section-link">
              {t('home.viewAll')} →
            </Link>
          </div>
          <div className="home__courses-grid">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* New Courses */}
      <section className="home__section">
        <div className="container">
          <div className="home__section-header">
            <h2 className="home__section-title">{t('home.newCourses')}</h2>
            <Link to="/catalog" className="home__section-link">
              {t('home.viewAll')} →
            </Link>
          </div>
          <div className="home__courses-grid">
            {newCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="home__section home__section--categories">
        <div className="container">
          <div className="home__section-header">
            <h2 className="home__section-title">{t('home.categories')}</h2>
          </div>
          <div className="home__categories">
            <Link to="/catalog?category=programming" className="home__category">
              <span className="home__category-icon">💻</span>
              <span className="home__category-name">Программирование</span>
            </Link>
            <Link to="/catalog?category=design" className="home__category">
              <span className="home__category-icon">🎨</span>
              <span className="home__category-name">Дизайн</span>
            </Link>
            <Link to="/catalog?category=languages" className="home__category">
              <span className="home__category-icon">🌍</span>
              <span className="home__category-name">Языки</span>
            </Link>
            <Link to="/catalog?category=business" className="home__category">
              <span className="home__category-icon">💼</span>
              <span className="home__category-name">Бизнес</span>
            </Link>
            <Link to="/catalog?category=marketing" className="home__category">
              <span className="home__category-icon">📢</span>
              <span className="home__category-name">Маркетинг</span>
            </Link>
            <Link to="/catalog?category=data-science" className="home__category">
              <span className="home__category-icon">📊</span>
              <span className="home__category-name">Data Science</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
