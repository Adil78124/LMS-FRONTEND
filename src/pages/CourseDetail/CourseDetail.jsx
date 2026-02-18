import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { reviewService } from '../../services/reviewService';
import { favoriteService } from '../../services/favoriteService';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Loader from '../../components/UI/Loader/Loader';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { setCourseTotalLessons } = useProgress();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await courseService.getById(id);
        if (cancelled) return;
        setCourse(data);
        setCourseTotalLessons(id, data.lessons?.length || 0);

        if (isAuthenticated) {
          try {
            const [enrolledData, favData] = await Promise.all([
              enrollmentService.checkEnrollment(parseInt(id, 10)),
              favoriteService.check(parseInt(id, 10)),
            ]);
            if (!cancelled) setEnrolled(enrolledData);
            if (!cancelled) setIsFavorite(favData);
          } catch {
            if (!cancelled) setEnrolled(false);
            if (!cancelled) setIsFavorite(false);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadReviews() {
      try {
        const [reviewsData, myReviewData] = await Promise.all([
          reviewService.getByCourse(parseInt(id, 10)),
          isAuthenticated ? reviewService.getMyReview(parseInt(id, 10)) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        setMyReview(myReviewData);
      } catch {
        if (!cancelled) setReviews([]);
      }
    }

    loadReviews();
    return () => { cancelled = true; };
  }, [id, isAuthenticated]);

  const refreshCourseAndReviews = async () => {
    try {
      const [courseData, reviewsData] = await Promise.all([
        courseService.getById(id),
        reviewService.getByCourse(parseInt(id, 10)),
      ]);
      if (courseData) setCourse(courseData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch {}
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReviewSubmitting(true);
    try {
      await reviewService.create(parseInt(id, 10), {
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });
      setMyReview({ rating: reviewForm.rating, comment: reviewForm.comment });
      await refreshCourseAndReviews();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEnrollLoading(true);
    try {
      await enrollmentService.enroll(parseInt(id, 10));
      setEnrolled(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.remove(parseInt(id, 10));
        setIsFavorite(false);
      } else {
        await favoriteService.add(parseInt(id, 10));
        setIsFavorite(true);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="course-detail">
        <div className="container">
          <div className="course-detail__loading">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <div className="container">
          <h1>{t('course.notFound')}</h1>
          <p>{error}</p>
          <Button onClick={() => navigate('/catalog')}>{t('course.backToHome')}</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 0 }).format(price ?? 0);
  const formatDuration = (minutes) => {
    const m = minutes ?? 0;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}мин` : ''}` : `${mins}мин`;
  };

  const getCourseImage = () => {
    if (course.image) return course.image;
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
    return `https://source.unsplash.com/800x450/?${keywords}&sig=${course.id}`;
  };

  const price = course.currentPrice ?? course.price ?? 0;
  const totalLessons = course.lessons?.length ?? 0;
  const totalMinutes = course.lessons?.reduce((acc, l) => acc + (l.duration ?? 0), 0) ?? course.duration ?? 0;

  return (
    <div className="course-detail">
      <div className="course-detail__back-wrap container">
        <Button
          variant="ghost"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/catalog'))}
          className="course-detail__back"
        >
          ← {t('common.back')}
        </Button>
      </div>

      <div className="course-detail__hero">
        <div className="course-detail__hero-bg">
          <img
            src={getCourseImage()}
            alt=""
            loading="lazy"
onError={(e) => {
                  e.target.style.display = 'none';
                  const next = e.target.nextElementSibling;
                  if (next) next.style.display = 'flex';
                }}
          />
          <div className="course-detail__hero-placeholder" style={{ display: 'none' }}>📚</div>
          <div className="course-detail__hero-overlay" aria-hidden="true" />
        </div>
        <div className="container course-detail__hero-inner">
          <div className="course-detail__hero-content">
            <h1 className="course-detail__title">{course.title}</h1>
            <p className="course-detail__hero-desc">
              {course.description || course.fullDescription?.slice(0, 200) || ''}
              {(course.fullDescription?.length ?? 0) > 200 ? '…' : ''}
            </p>
            <div className="course-detail__hero-meta">
              <span className="course-detail__hero-meta-item">
                <span className="course-detail__hero-meta-icon">📚</span>
                {totalLessons} {t('course.lessons')}
              </span>
              <span className="course-detail__hero-meta-item">
                <span className="course-detail__hero-meta-icon">⏱</span>
                {formatDuration(totalMinutes)}
              </span>
              <span className="course-detail__hero-meta-item">
                <span className="course-detail__hero-meta-icon">👥</span>
                {course.studentsCount ?? 0}+ {t('course.students')}
              </span>
              {course.level && (
                <span className="course-detail__level course-detail__level--hero">
                  {t(`catalog.${course.level}`) || course.level}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-detail__layout">
          <main className="course-detail__main">
            {course.whatYouWillLearn?.length > 0 && (
              <section className="course-detail__section course-detail__section--learn">
                <h2 className="course-detail__section-title">{t('course.whatYouWillLearn')}</h2>
                <ul className="course-detail__list course-detail__list--check">
                  {course.whatYouWillLearn.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="course-detail__section">
              <h2 className="course-detail__section-title">{t('course.aboutCourse')}</h2>
              <p>{course.fullDescription || course.description}</p>
            </section>

              {course.requirements?.length > 0 && (
                <section className="course-detail__section">
                  <h2 className="course-detail__section-title">{t('course.requirements')}</h2>
                  <ul className="course-detail__list">
                    {course.requirements.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section id="course-content" className="course-detail__section">
                <h2 className="course-detail__section-title">{t('course.courseContent')}</h2>
                <div className="course-detail__lessons">
                  {course.lessons?.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={enrolled ? `/course/${id}/lesson/${lesson.id}` : '#'}
                      className={`course-detail__lesson ${!enrolled ? 'course-detail__lesson--locked' : ''}`}
                      onClick={(e) => !enrolled && e.preventDefault()}
                    >
                      <span className="course-detail__lesson-number">{(lesson.order ?? 0) + 1}</span>
                      <div className="course-detail__lesson-info">
                        <h3>{lesson.title}</h3>
                        <span>{formatDuration(lesson.duration)}</span>
                      </div>
                      {!enrolled && <span className="course-detail__lesson-lock">🔒</span>}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="course-detail__section course-detail__reviews">
                <h2 className="course-detail__section-title">{t('review.title')} ({reviews.length})</h2>

                {isAuthenticated && !myReview && (
                  <div className="course-detail__review-form">
                    <h3>{t('review.leaveReview')}</h3>
                    <div className="course-detail__review-rating">
                      <label>{t('review.yourRating')}</label>
                      <div className="course-detail__stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`course-detail__star ${reviewForm.rating >= star ? 'active' : ''}`}
                            onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="course-detail__review-comment">
                      <label htmlFor="review-comment">{t('review.comment')}</label>
                      <textarea
                        id="review-comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                        rows={3}
                        placeholder={t('review.comment')}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleSubmitReview}
                      disabled={reviewSubmitting}
                    >
                      {reviewSubmitting ? t('common.loading') : t('review.submit')}
                    </Button>
                  </div>
                )}

                {isAuthenticated && myReview && (
                  <p className="course-detail__review-notice">{t('review.alreadyReviewed')}</p>
                )}

                {!isAuthenticated && (
                  <p className="course-detail__review-notice">{t('review.loginToReview')}</p>
                )}

                {reviews.length === 0 && !isAuthenticated && (
                  <p className="course-detail__review-empty">{t('review.noReviews')}</p>
                )}

                {reviews.length > 0 && (
                  <div className="course-detail__reviews-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="course-detail__review-item">
                        <div className="course-detail__review-header">
                          <span className="course-detail__review-author">{r.author}</span>
                          <span className="course-detail__review-stars">
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="course-detail__review-text">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
          </main>

          <aside className="course-detail__sidebar">
            <Card className="course-detail__purchase-card">
              <div className="course-detail__price">
                {course.oldPrice != null && course.oldPrice > 0 && (
                  <span className="course-detail__price-old">{formatPrice(course.oldPrice)}</span>
                )}
                <span className="course-detail__price-current">
                  {price > 0 ? formatPrice(price) : t('catalog.free')}
                </span>
              </div>

              {enrolled ? (
                <>
                  <Link to={`/course/${id}/lesson/${course.lessons?.[0]?.id}`}>
                    <Button variant="primary" size="lg" fullWidth className="course-detail__btn-primary">
                      {t('course.continueLearning')}
                    </Button>
                  </Link>
                  <p className="course-detail__sidebar-note">{t('course.learnNow')}</p>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="course-detail__btn-primary"
                    onClick={handleEnroll}
                    disabled={enrollLoading || !isAuthenticated}
                  >
                    {enrollLoading ? t('common.loading') : isAuthenticated ? t('course.buyOrEnroll') : t('nav.signIn')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    className="course-detail__btn-secondary"
                    onClick={() => addToCart(course)}
                    disabled={isInCart(course.id)}
                  >
                    {isInCart(course.id) ? t('course.inCart') : t('course.wantToTake')}
                  </Button>
                  <p className="course-detail__sidebar-note">{t('course.accessAfterEnroll')}</p>
                </>
              )}

              <div className="course-detail__includes">
                <h3>{t('course.inProgram')}</h3>
                <ul className="course-detail__includes-list">
                  <li><span className="course-detail__includes-icon">📚</span> {totalLessons} {t('course.lessons')}</li>
                  <li><span className="course-detail__includes-icon">⏱</span> {formatDuration(totalMinutes)}</li>
                  <li><span className="course-detail__includes-icon">✅</span> {Math.max(0, Math.floor(totalLessons * 1.5))} {t('course.tests')}</li>
                </ul>
                <a href="#course-content" className="course-detail__content-link">{t('course.contentsLink')}</a>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
