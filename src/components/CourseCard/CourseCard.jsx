import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useProgress } from '../../contexts/ProgressContext';
import Button from '../UI/Button/Button';
import Card from '../UI/Card/Card';
import './CourseCard.css';

const CourseCard = ({ course, enrollmentProgress, isEnrolled, isFavorite = false, onToggleFavorite }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const { getCourseProgress } = useProgress();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const progress = getCourseProgress(course.id);
  const courseProgress = enrollmentProgress ?? progress.progressPercentage ?? 0;
  const showProgressBar = courseProgress > 0 || isEnrolled;
  const showProgressPercent = isEnrolled === true;

  const handleCardClick = () => {
    navigate(`/course/${course.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(course);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || favoriteLoading) return;
    setFavoriteLoading(true);
    onToggleFavorite(course.id)
      .catch(() => {})
      .finally(() => setFavoriteLoading(false));
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

  // URL изображений для курсов (красивые фото с Unsplash)
  const getCourseImage = () => {
    if (course.image) {
      return course.image;
    }
    // Запасные картинки для популярных курсов
    const title = (course.title || '').toLowerCase();
    if (title.includes('английск') || title.includes('english')) {
      return 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80';
    }
    if (title.includes('python')) {
      return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80';
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
        {(course.currentPrice ?? course.price ?? 0) === 0 && (
          <span className="course-card__badge course-card__badge--free">{t('catalog.free')}</span>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            className={`course-card__favorite ${isFavorite ? 'course-card__favorite--active' : ''}`}
            onClick={handleFavoriteClick}
            disabled={favoriteLoading}
            aria-label={isFavorite ? t('favorite.removeFromFavorites') : t('favorite.addToFavorites')}
            title={isFavorite ? t('favorite.removeFromFavorites') : t('favorite.addToFavorites')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}
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
        {showProgressBar && (
          <div className="course-card__progress-wrap">
            <div className="course-card__progress">
              <div
                className="course-card__progress-bar"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
            {showProgressPercent && (
              <span className="course-card__progress-label">{t('profile.progress')}: {Math.round(courseProgress)}%</span>
            )}
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
          {isEnrolled ? (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const firstLessonId = course.lessons?.[0]?.id;
                if (firstLessonId) {
                  navigate(`/course/${course.id}/lesson/${firstLessonId}`);
                } else {
                  navigate(`/course/${course.id}`);
                }
              }}
            >
              {t('course.continueLearning')}
            </Button>
          ) : (
            <Button
              variant={isInCart(course.id) ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleAddToCart}
              disabled={isInCart(course.id)}
            >
              {isInCart(course.id) ? t('course.inCart') : t('course.addToCart')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;
