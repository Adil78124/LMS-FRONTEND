import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useProgress } from '../../contexts/ProgressContext';
import { getCourseById } from '../../data/mockData';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addToCart, isInCart } = useCart();
  const { getCourseProgress, setCourseTotalLessons } = useProgress();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const courseData = getCourseById(id);
    if (courseData) {
      setCourse(courseData);
      setCourseTotalLessons(id, courseData.lessons?.length || 0);
    }
  }, [id, setCourseTotalLessons]);

  if (!course) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1>{t('course.notFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('course.backToHome')}</Button>
        </div>
      </div>
    );
  }

  const progress = getCourseProgress(id);
  const formatPrice = (price) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0 }).format(price);
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}мин` : ''}` : `${mins}мин`;
  };

  // Генерируем URL изображения с Unsplash на основе категории курса
  const getCourseImage = () => {
    if (course.image) {
      return course.image;
    }
    
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
    const imageId = course.id % 1000;
    return `https://source.unsplash.com/800x450/?${keywords}&sig=${imageId}`;
  };

  return (
    <div className="course-detail">
      <div className="container">
        <Button 
          variant="ghost" 
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/catalog');
            }
          }} 
          className="course-detail__back"
        >
          ← {t('common.back')}
        </Button>

        <div className="course-detail__layout">
          <main className="course-detail__main">
            <div className="course-detail__header">
              <div className="course-detail__image">
                <img 
                  src={getCourseImage()} 
                  alt={course.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="course-detail__placeholder" style={{ display: 'none' }}>📚</div>
              </div>
              <div className="course-detail__info">
                <span className="course-detail__category">{course.category}</span>
                <h1 className="course-detail__title">{course.title}</h1>
                <p className="course-detail__author">{t('course.author')}: {course.author}</p>
                <div className="course-detail__meta">
                  <span>⭐ {course.rating}</span>
                  <span>({course.reviewsCount} {t('course.reviews')})</span>
                  <span>{course.studentsCount}+ {t('course.students')}</span>
                </div>
              </div>
            </div>

            <div className="course-detail__sections">
              <section className="course-detail__section">
                <h2>{t('course.description')}</h2>
                <p>{course.fullDescription || course.description}</p>
              </section>

              {course.whatYouWillLearn && (
                <section className="course-detail__section">
                  <h2>{t('course.whatYouWillLearn')}</h2>
                  <ul className="course-detail__list">
                    {course.whatYouWillLearn.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {course.requirements && (
                <section className="course-detail__section">
                  <h2>{t('course.requirements')}</h2>
                  <ul className="course-detail__list">
                    {course.requirements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="course-detail__section">
                <h2>{t('course.courseContent')}</h2>
                <div className="course-detail__lessons">
                  {course.lessons?.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/course/${id}/lesson/${lesson.id}`}
                      className="course-detail__lesson"
                    >
                      <span className="course-detail__lesson-number">{lesson.order}</span>
                      <div className="course-detail__lesson-info">
                        <h3>{lesson.title}</h3>
                        <span>{formatDuration(lesson.duration)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </main>

          <aside className="course-detail__sidebar">
            <Card className="course-detail__purchase-card">
              <div className="course-detail__price">
                {course.oldPrice && (
                  <span className="course-detail__price-old">{formatPrice(course.oldPrice)}</span>
                )}
                <span className="course-detail__price-current">
                  {course.currentPrice ? formatPrice(course.currentPrice) : t('catalog.free')}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => addToCart(course)}
                disabled={isInCart(course.id)}
              >
                {isInCart(course.id) ? t('course.inCart') : t('course.addToCart')}
              </Button>
              <Button variant="outline" size="lg" fullWidth>
                {t('course.buyNow')}
              </Button>

              <div className="course-detail__includes">
                <h3>{t('course.includes')}:</h3>
                <ul>
                  <li>📚 {course.lessons?.length || 0} {t('course.lessons')}</li>
                  <li>⏱️ {formatDuration(course.duration)}</li>
                  <li>✅ {Math.floor((course.lessons?.length || 0) * 1.5)} {t('course.tests')}</li>
                </ul>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
