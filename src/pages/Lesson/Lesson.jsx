import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useProgress } from '../../contexts/ProgressContext';
import { getCourseById } from '../../data/mockData';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import './Lesson.css';

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { markLessonCompleted, isLessonCompleted, getCourseProgress } = useProgress();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    const courseData = getCourseById(courseId);
    if (courseData) {
      setCourse(courseData);
      const lessonData = courseData.lessons?.find((l) => l.id === parseInt(lessonId));
      if (lessonData) {
        setLesson(lessonData);
      }
    }
  }, [courseId, lessonId]);

  if (!course || !lesson) {
    return (
      <div className="lesson">
        <div className="container">
          <h1>{t('lesson.notFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('lesson.backToHome')}</Button>
        </div>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const currentIndex = lessons.findIndex((l) => l.id === parseInt(lessonId));
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const completed = isLessonCompleted(courseId, parseInt(lessonId));

  const handleComplete = () => {
    markLessonCompleted(courseId, parseInt(lessonId));
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}мин` : ''}` : `${mins}мин`;
  };

  return (
    <div className="lesson">
      <div className="container">
        <div className="lesson__header">
          <Link to={`/course/${courseId}`} className="lesson__back">
            ← {t('lesson.backToCourse')}
          </Link>
          <h1 className="lesson__title">{lesson.title}</h1>
          <div className="lesson__meta">
            <span>{formatDuration(lesson.duration)}</span>
            <span>{lesson.type}</span>
            {completed && <span className="lesson__completed">✅ {t('lesson.completed')}</span>}
          </div>
        </div>

        <div className="lesson__content">
          <Card className="lesson__card">
            <div className="lesson__description">
              <h2>{t('lesson.description')}</h2>
              <p>{lesson.description || t('lesson.descriptionPlaceholder')}</p>
            </div>

            <div className="lesson__video">
              <div className="lesson__video-placeholder">
                <span>🎥</span>
                <p>{t('lesson.videoPlaceholder')}</p>
              </div>
            </div>

            <div className="lesson__actions">
              {!completed && (
                <Button variant="primary" onClick={handleComplete}>
                  {t('lesson.markCompleted')}
                </Button>
              )}
              {completed && (
                <div className="lesson__completed-message">
                  ✅ {t('lesson.completed')}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lesson__navigation">
          {prevLesson && (
            <Link to={`/course/${courseId}/lesson/${prevLesson.id}`} className="lesson__nav-link">
              <Button variant="outline">
                ← {t('lesson.previousLesson')}
              </Button>
            </Link>
          )}
          {nextLesson && (
            <Link to={`/course/${courseId}/lesson/${nextLesson.id}`} className="lesson__nav-link">
              <Button variant="primary">
                {t('lesson.nextLesson')} →
              </Button>
            </Link>
          )}
          {!prevLesson && !nextLesson && (
            <Link to={`/course/${courseId}`} className="lesson__nav-link">
              <Button variant="outline">
                {t('lesson.backToCourse')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
