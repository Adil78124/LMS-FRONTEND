import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { enrollmentService } from '../../services/enrollmentService';
import { contentService } from '../../services/contentService';
import { API_BASE_URL } from '../../config/api';
import Button from '../../components/UI/Button/Button';
import Card from '../../components/UI/Card/Card';
import Loader from '../../components/UI/Loader/Loader';
import './Lesson.css';

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(null);

  // Модули урока: { module, underModules: [{ underModule, access, contentItems }] }
  const [modulesData, setModulesData] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [completedUnderModuleIds, setCompletedUnderModuleIds] = useState(() => new Set());
  const [lessonScoresDetail, setLessonScoresDetail] = useState(null);
  const [courseScore, setCourseScore] = useState(null);

  const lid = parseInt(lessonId, 10);
  const cid = parseInt(courseId, 10);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [courseData, enrollData] = await Promise.all([
          courseService.getById(courseId),
          isAuthenticated ? enrollmentService.checkEnrollment(cid) : Promise.resolve(false),
        ]);
        if (cancelled) return;

        setCourse(courseData);
        setEnrolled(!!enrollData);
        if (enrollData) {
          try {
            const list = await enrollmentService.getMyEnrollments();
            const myEnroll = (list || []).find((e) => e.id === cid);
            if (myEnroll?.enrollment?.progressPercent != null) setEnrollmentProgress(myEnroll.enrollment.progressPercent);
          } catch {
            // ignore
          }
        }

        const lessonData = courseData?.lessons?.find((l) => l.id === lid);
        if (lessonData) setLesson(lessonData);
      } catch {
        if (!cancelled) setCourse(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [courseId, lessonId, isAuthenticated, cid, lid]);

  const loadModules = useCallback(async () => {
    if (!lid) return;
    setLoadingModules(true);
    try {
      const modules = await contentService.getModules(lid);
      const list = Array.isArray(modules) ? modules : [];
      const withUnder = await Promise.all(
        list.map(async (mod) => {
          const underList = await contentService.getUnderModules(mod.id).catch(() => []);
          const underModules = Array.isArray(underList) ? underList : [];
          const withAccessAndContent = await Promise.all(
            underModules.map(async (um) => {
              const [accessRes, contentList] = await Promise.all([
                contentService.getAccess(um.id).catch(() => ({ access: false })),
                contentService.getContent(um.id).catch(() => []),
              ]);
              return {
                underModule: um,
                access: !!accessRes?.access,
                contentItems: Array.isArray(contentList) ? contentList : [],
              };
            }),
          );
          return { module: mod, underModules: withAccessAndContent };
        }),
      );
      setModulesData(withUnder);
    } catch {
      setModulesData([]);
    } finally {
      setLoadingModules(false);
    }
  }, [lid]);

  useEffect(() => {
    if (!enrolled || !isAuthenticated || !lesson) return;
    loadModules();
  }, [enrolled, isAuthenticated, lesson, loadModules]);

  useEffect(() => {
    if (!enrolled || !lid || !cid) return;
    Promise.all([
      contentService.getLessonScoresDetail(lid).catch(() => null),
      contentService.getCourseScore(cid).catch(() => null),
    ]).then(([detail, courseSc]) => {
      setLessonScoresDetail(detail || null);
      setCourseScore(courseSc || null);
    });
  }, [enrolled, lid, cid, modulesData]);

  const handleMarkComplete = async (underModuleId) => {
    setCompletingId(underModuleId);
    try {
      const res = await contentService.markComplete(underModuleId);
      setCompletedUnderModuleIds((prev) => new Set(prev).add(underModuleId));
      if (res?.progressPercent != null) setEnrollmentProgress(res.progressPercent);
      await loadModules();
    } catch {
      // ignore
    } finally {
      setCompletingId(null);
    }
  };

  const formatDuration = (minutes) => {
    const m = minutes ?? 0;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}мин` : ''}` : `${mins}мин`;
  };

  if (loading) {
    return (
      <div className="lesson">
        <div className="container">
          <div className="lesson__loading">
            <Loader />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

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

  if (!isAuthenticated) {
    return (
      <div className="lesson">
        <div className="container">
          <div className="lesson__auth-required">
            <h1>{t('lesson.authRequired')}</h1>
            <div className="lesson__auth-actions">
              <Link to="/login">
                <Button variant="primary">{t('nav.signIn')}</Button>
              </Link>
              <Link to={`/course/${courseId}`}>
                <Button variant="outline">{t('lesson.backToCourse')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!enrolled) {
    return (
      <div className="lesson">
        <div className="container">
          <div className="lesson__auth-required">
            <h1>{t('lesson.enrollRequired')}</h1>
            <Link to={`/course/${courseId}`}>
              <Button>{t('lesson.backToCourse')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lessons = [...(course.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentIndex = lessons.findIndex((l) => l.id === lid);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 && currentIndex >= 0 ? lessons[currentIndex + 1] : null;

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
            {enrollmentProgress != null && (
              <span className="lesson__progress-badge">{t('lesson.progress')}: {enrollmentProgress}%</span>
            )}
            {courseScore != null && (
              <span className={`lesson__score-badge ${courseScore.passed ? 'lesson__score-badge_passed' : ''}`}>
                {t('lesson.scoreCourse')}: {courseScore.percent}% {courseScore.passed ? `✓ ${t('lesson.coursePassed')}` : `(${t('lesson.need70')})`}
              </span>
            )}
          </div>
          {lessonScoresDetail?.lessonScore && (
            <div className="lesson__lesson-score">
              <strong>{t('lesson.scoreLesson')}:</strong> {lessonScoresDetail.lessonScore.totalEarned} / {lessonScoresDetail.lessonScore.totalMax} ({lessonScoresDetail.lessonScore.percent}%)
              {lessonScoresDetail.lessonScore.passed ? (
                <span className="lesson__passed"> ✓ {t('lesson.passed')}</span>
              ) : (
                <span className="lesson__need"> — {t('lesson.need70')}</span>
              )}
            </div>
          )}
        </div>

        <div className="lesson__content">
          <Card className="lesson__card">
            <div className="lesson__description">
              <h2>{t('lesson.description')}</h2>
              <p>{lesson.description || t('lesson.descriptionPlaceholder')}</p>
            </div>

            {loadingModules ? (
              <div className="lesson__modules-loading">
                <Loader />
                <p>{t('common.loading')}</p>
              </div>
            ) : modulesData.length > 0 ? (
              <div className="lesson__modules">
                <h2 className="lesson__modules-title">{t('lesson.modulesTitle')}</h2>
                {modulesData.map(({ module: mod, underModules }) => (
                  <div key={mod.id} className="lesson__module">
                    <h3 className="lesson__module-title">{t('lesson.module')} {mod.order != null ? mod.order + 1 : ''}: {mod.title}</h3>
                    {underModules.map(({ underModule: um, access, contentItems }) => {
                      const completed = completedUnderModuleIds.has(um.id);
                      const scoreItem = lessonScoresDetail?.items?.find((i) => i.underModuleId === um.id);
                      return (
                        <div
                          key={um.id}
                          className={`lesson__submodule ${!access ? 'lesson__submodule_locked' : ''} ${completed ? 'lesson__submodule_completed' : ''}`}
                        >
                          <h4 className="lesson__submodule-title">
                            {t('lesson.submodule')} {um.order != null ? um.order + 1 : ''}: {um.title}
                            {completed && <span className="lesson__submodule-done"> ✓ {t('lesson.completed')}</span>}
                            {scoreItem != null && (scoreItem.maxScore > 0) && (
                              <span className="lesson__submodule-score">
                                {' '}({t('lesson.yourScore')}: {scoreItem.earnedScore} / {scoreItem.maxScore})
                              </span>
                            )}
                          </h4>
                          {!access ? (
                            <p className="lesson__submodule-locked">{t('lesson.completeFirst')}</p>
                          ) : (
                            <>
                              <div className="lesson__submodule-content">
                                {contentItems.length === 0 ? (
                                  <p className="lesson__content-empty">{t('lesson.content')} — {t('common.none')}</p>
                                ) : (
                                  contentItems
                                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                    .map((item) => (
                                      <div key={item.id} className="lesson__content-item">
                                        {item.title && <h5>{item.title}</h5>}
                                        {item.text && <div className="lesson__content-text" dangerouslySetInnerHTML={{ __html: item.text }} />}
                                        {item.video && (
                                          <div className="lesson__content-video">
                                            <video
                                              src={item.video.startsWith('/') ? `${API_BASE_URL}${item.video}` : item.video}
                                              controls
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))
                                )}
                              </div>
                              {!completed && (
                                <div className="lesson__submodule-actions">
                                  <Button
                                    variant="primary"
                                    disabled={!!completingId}
                                    onClick={() => handleMarkComplete(um.id)}
                                  >
                                    {completingId === um.id ? t('common.loading') : t('lesson.markSubmoduleComplete')}
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        <div className="lesson__navigation">
          {prevLesson && (
            <Link to={`/course/${courseId}/lesson/${prevLesson.id}`} className="lesson__nav-link">
              <Button variant="outline">← {t('lesson.previousLesson')}</Button>
            </Link>
          )}
          {nextLesson && (
            <Link to={`/course/${courseId}/lesson/${nextLesson.id}`} className="lesson__nav-link">
              <Button variant="primary">{t('lesson.nextLesson')} →</Button>
            </Link>
          )}
          {!prevLesson && !nextLesson && (
            <Link to={`/course/${courseId}`} className="lesson__nav-link">
              <Button variant="outline">{t('lesson.backToCourse')}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
