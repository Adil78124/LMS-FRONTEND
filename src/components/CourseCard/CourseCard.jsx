import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useProgress } from '../../contexts/ProgressContext';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const { getCourseProgress } = useProgress();

  const progress = getCourseProgress(course.id);
  const courseProgress = progress.progressPercentage || 0;

  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(course);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins > 0 ? `${mins}мин` : ''}`;
    }
    return `${mins}мин`;
  };

  // Генерируем URL изображения с Unsplash на основе категории курса
  const getCourseImage = () => {
    if (course.image) {
      return course.image;
    }
    
    // Маппинг категорий на ключевые слова для Unsplash
    const categoryKeywords = {
      'Программирование': 'programming,code,computer',
      'Дизайн': 'design,creative,art',
      'Языки': 'language,books,education',
      'Бизнес': 'business,office,meeting',
      'Маркетинг': 'marketing,advertising,social-media',
      'Веб-разработка': 'web-development,website,code',
      'Data Science': 'data-science,analytics,charts',
      'Мобильная разработка': 'mobile-app,smartphone,technology',
      'Школьные предметы': 'education,school,learning',
    };
    
    const keywords = categoryKeywords[course.category] || 'education,learning';
    const imageId = course.id % 1000; // Используем ID курса для разнообразия
    return `https://source.unsplash.com/400x250/?${keywords}&sig=${imageId}`;
  };

  return (
    <Card
      className="course-card"
      hoverable
      elevated
      onClick={handleCardClick}
    >
      <div className="course-card__image">
        <img 
          src={getCourseImage()} 
          alt={course.title}
          loading="lazy"
          onError={(e) => {
            // Fallback если изображение не загрузилось
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        <div className="course-card__placeholder" style={{ display: 'none' }}>
          <span className="course-card__placeholder-icon">📚</span>
        </div>
        {courseProgress > 0 && (
          <div className="course-card__progress">
            <div
              className="course-card__progress-bar"
              style={{ width: `${courseProgress}%` }}
            />
          </div>
        )}
      </div>

      <div className="course-card__content">
        <div className="course-card__category">{course.category}</div>
        <h3 className="course-card__title">{course.title}</h3>
        <div className="course-card__author">{t('course.author')}: {course.author}</div>

        <div className="course-card__meta">
          <div className="course-card__rating">
            <span className="course-card__stars">⭐</span>
            <span>{course.rating}</span>
            <span className="course-card__reviews">({course.reviewsCount})</span>
          </div>
          <div className="course-card__students">{course.studentsCount}+ {t('course.students')}</div>
        </div>

        <div className="course-card__info">
          <span className="course-card__level">{course.level}</span>
          <span className="course-card__duration">{formatDuration(course.duration)}</span>
        </div>

        <div className="course-card__footer">
          <div className="course-card__price">
            {course.oldPrice && (
              <span className="course-card__price-old">
                {formatPrice(course.oldPrice)}
              </span>
        )}
            <span className="course-card__price-current">
              {course.currentPrice ? formatPrice(course.currentPrice) : t('catalog.free')}
            </span>
          </div>
          <Button
            variant={isInCart(course.id) ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleAddToCart}
            disabled={isInCart(course.id)}
          >
            {isInCart(course.id) ? t('course.inCart') : t('course.addToCart')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
