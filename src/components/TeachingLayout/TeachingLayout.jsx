import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, Outlet } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { courseService } from '../../services/courseService';
import Button from '../UI/Button/Button';
import Loader from '../UI/Loader/Loader';
import './TeachingLayout.css';

const TeachingLayout = () => {
  const { t } = useLanguage();
  const { id: courseId } = useParams();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOnCoursePage = !!courseId && (location.pathname.includes('/lessons') || location.pathname.includes('/info'));
  const isLessonsPage = !!courseId && location.pathname.includes('/lessons');
  const isInfoPage = !!courseId && location.pathname.includes('/info');
  const isCreatePage = location.pathname === '/teaching/course/new';
  const isAnalyticsPage = location.pathname === '/teaching/analytics';

  useEffect(() => {
    let cancelled = false;
    courseService
      .getMyCourses()
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
  }, []);

  useEffect(() => {
    if (!courseId || !isOnCoursePage) {
      setCurrentCourse(null);
      return;
    }
    let cancelled = false;
    courseService
      .getById(courseId)
      .then((data) => {
        if (!cancelled) setCurrentCourse(data);
      })
      .catch(() => {
        if (!cancelled) setCurrentCourse(null);
      });
    return () => { cancelled = true; };
  }, [courseId, isOnCoursePage]);

  const handlePublish = async () => {
    if (!currentCourse?.id) return;
    try {
      await courseService.update(currentCourse.id, { status: 'publish' });
      setCurrentCourse((c) => (c ? { ...c, status: 'publish' } : null));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="teaching-layout">
      <aside className="teaching-layout__sidebar">
        <div className="teaching-layout__sidebar-inner">
          {loading ? (
            <div className="teaching-layout__sidebar-loading">
              <Loader />
            </div>
          ) : (
            <>
              <Link to="/teaching/course/new" className="teaching-layout__new-course-btn">
                <span className="teaching-layout__new-course-icon">+</span>
                {t('teaching.newCourse')}
              </Link>

              {isOnCoursePage && currentCourse && (
                <div className="teaching-layout__course-block">
                  <div className="teaching-layout__course-title">{currentCourse.title || '—'}</div>
                  <div className="teaching-layout__course-badges">
                    {currentCourse.status === 'draft' && (
                      <span className="teaching-layout__badge teaching-layout__badge--draft">
                        {t('teaching.draftBadge')}
                      </span>
                    )}
                    {currentCourse.status === 'publish' && (
                      <span className="teaching-layout__badge teaching-layout__badge--published">
                        {t('teaching.published')}
                      </span>
                    )}
                  </div>
                  {currentCourse.status === 'draft' && (
                    <Button variant="primary" size="sm" className="teaching-layout__publish-btn" onClick={handlePublish}>
                      {t('teaching.publish')}
                    </Button>
                  )}
                  <nav className="teaching-layout__course-nav">
                    <span className="teaching-layout__course-nav-label">{t('teaching.courseNavLabel')}</span>
                    <Link
                      to={`/teaching/course/${currentCourse.id}/info`}
                      className={`teaching-layout__course-nav-link ${isInfoPage ? 'teaching-layout__course-nav-link--active' : ''}`}
                    >
                      {t('teaching.description')}
                    </Link>
                    <Link
                      to={`/teaching/course/${currentCourse.id}/lessons`}
                      className={`teaching-layout__course-nav-link ${isLessonsPage ? 'teaching-layout__course-nav-link--active' : ''}`}
                    >
                      {t('teaching.content')}
                    </Link>
                  </nav>
                </div>
              )}

              <nav className="teaching-layout__nav">
                <Link
                  to="/teaching"
                  className={`teaching-layout__nav-link ${!courseId && !isCreatePage && !isAnalyticsPage ? 'teaching-layout__nav-link--active' : ''}`}
                >
                  {t('teaching.courses')}
                </Link>
                {courses.length > 0 && (
                  <ul className="teaching-layout__course-list">
                    {courses.slice(0, 15).map((c) => (
                      <li key={c.id}>
                        <Link
                          to={`/teaching/course/${c.id}/lessons`}
                          className={`teaching-layout__course-link ${courseId === String(c.id) && isOnCoursePage ? 'teaching-layout__course-link--active' : ''}`}
                        >
                          {c.title || 'Без названия'}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/teaching/analytics"
                  className={`teaching-layout__nav-link ${isAnalyticsPage ? 'teaching-layout__nav-link--active' : ''}`}
                >
                  {t('teaching.analytics')}
                </Link>
              </nav>

              <div className="teaching-layout__sidebar-footer">
                <a href="#help" className="teaching-layout__footer-link">{t('teaching.help')}</a>
              </div>
            </>
          )}
        </div>
      </aside>
      <div className="teaching-layout__main">
        <Outlet />
      </div>
    </div>
  );
};

export default TeachingLayout;
