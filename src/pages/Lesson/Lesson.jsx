import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
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

/** Плоский список шагов урока (как в Stepik: модуль → подмодули по порядку) */
function buildFlatSteps(modulesData) {
  const list = [];
  const sortedModules = [...(modulesData || [])].sort((a, b) => (a.module?.order ?? 0) - (b.module?.order ?? 0));
  sortedModules.forEach(({ module: mod, underModules }) => {
    const sorted = [...(underModules || [])].sort((a, b) => (a.underModule?.order ?? 0) - (b.underModule?.order ?? 0));
    sorted.forEach((item) => list.push({ ...item, moduleTitle: mod?.title }));
  });
  return list;
}

const STEP_TYPE_LABELS = {
  introduction: 'Введение',
  theory: 'Теория',
  video: 'Видео',
  practice: 'Практика',
  test: 'Тест',
};

const Lesson = () => {
  const { courseId, lessonId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentProgress, setEnrollmentProgress] = useState(null);

  const [modulesData, setModulesData] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [completedUnderModuleIds, setCompletedUnderModuleIds] = useState(() => new Set());
  const [lessonScoresDetail, setLessonScoresDetail] = useState(null);
  const [courseScore, setCourseScore] = useState(null);
  const [testQuestions, setTestQuestions] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const lid = parseInt(lessonId, 10);
  const cid = parseInt(courseId, 10);

  const flatSteps = useMemo(() => buildFlatSteps(modulesData), [modulesData]);
  const stepIdFromUrl = searchParams.get('step');
  const currentStepIndex = useMemo(() => {
    if (!stepIdFromUrl) return 0;
    const idx = flatSteps.findIndex((s) => String(s.underModule?.id) === String(stepIdFromUrl));
    return idx >= 0 ? idx : 0;
  }, [flatSteps, stepIdFromUrl]);
  const currentStep = flatSteps[currentStepIndex] ?? null;
  const currentStepId = currentStep ? currentStep.underModule?.id : null;

  useEffect(() => {
    if (flatSteps.length > 0 && !stepIdFromUrl) {
      setSearchParams({ step: flatSteps[0].underModule.id }, { replace: true });
    }
  }, [flatSteps, stepIdFromUrl, setSearchParams]);

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
          } catch {}
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

  const isCourseAuthor = Boolean(isAuthenticated && user?.id && course?.authorId === user.id);

  const loadModules = useCallback(async (isAuthor = false) => {
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
                access: isAuthor || !!accessRes?.access,
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
    if ((!enrolled && !isCourseAuthor) || !isAuthenticated || !lesson) return;
    loadModules(isCourseAuthor);
  }, [enrolled, isCourseAuthor, isAuthenticated, lesson, loadModules]);

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

  useEffect(() => {
    const um = currentStep?.underModule;
    if (um?.type === 'test') {
      setTestResult(null);
      setTestAnswers({});
      contentService
        .getTestQuestions(um.id)
        .then((data) => setTestQuestions(data.questions ?? []))
        .catch(() => setTestQuestions([]));
    } else {
      setTestQuestions(null);
      setTestResult(null);
    }
  }, [currentStep?.underModule?.id, currentStep?.underModule?.type]);

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

  const handleSubmitTest = async (underModuleId) => {
    const answers = Object.entries(testAnswers)
      .filter(([, answerId]) => answerId != null)
      .map(([questionId, answerId]) => ({ questionId: Number(questionId), answerId }));
    if (answers.length === 0) return;
    setTestSubmitting(true);
    try {
      const res = await contentService.submitTest(underModuleId, { answers });
      setTestResult(res);
      setCompletedUnderModuleIds((prev) => new Set(prev).add(underModuleId));
      if (res?.progressPercent != null) setEnrollmentProgress(res.progressPercent);
      const [detail, courseSc] = await Promise.all([
        contentService.getLessonScoresDetail(lid).catch(() => null),
        contentService.getCourseScore(cid).catch(() => null),
      ]);
      setLessonScoresDetail(detail || null);
      setCourseScore(courseSc || null);
    } catch (err) {
      alert(err?.message || 'Ошибка отправки');
    } finally {
      setTestSubmitting(false);
    }
  };

  const goToStep = (index) => {
    const s = flatSteps[index];
    if (s?.underModule?.id) setSearchParams({ step: s.underModule.id });
  };

  const formatDuration = (minutes) => {
    const m = minutes ?? 0;
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    return hours > 0 ? `${hours}ч ${mins > 0 ? `${mins}мин` : ''}` : `${mins}мин`;
  };

  if (loading) {
    return (
      <div className="lesson lesson--loading-wrap">
        <div className="lesson__loading">
          <Loader />
          <p>{t('common.loading')}</p>
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
              <Link to="/login"><Button variant="primary">{t('nav.signIn')}</Button></Link>
              <Link to={`/course/${courseId}`}><Button variant="outline">{t('lesson.backToCourse')}</Button></Link>
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
            <Link to={`/course/${courseId}`}><Button>{t('lesson.backToCourse')}</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const lessons = [...(course.lessons || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const currentLessonIndex = lessons.findIndex((l) => l.id === lid);
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < lessons.length - 1 && currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : null;

  return (
    <div className="lesson lesson--stepik">
      <div className="lesson__progress-top">
        <div className="lesson__progress-bar-wrap">
          <div className="lesson__progress-bar-fill" style={{ width: `${enrollmentProgress ?? 0}%` }} />
        </div>
        <div className="lesson__progress-labels">
          <span>{t('lesson.progress')}: {enrollmentProgress ?? 0}%</span>
          {courseScore != null && (
            <span className={courseScore.passed ? 'lesson__score-passed' : ''}>
              {t('lesson.scoreCourse')}: {courseScore.percent}%
            </span>
          )}
        </div>
      </div>

      <div className="lesson__layout">
        <aside className="lesson__sidebar">
          <Link to={`/course/${courseId}`} className="lesson__sidebar-back">
            ← {course.title}
          </Link>
          <h2 className="lesson__sidebar-title">{lesson.title}</h2>
          <nav className="lesson__sidebar-nav">
            {lessons.map((l, idx) => (
              <Link
                key={l.id}
                to={`/course/${courseId}/lesson/${l.id}`}
                className={`lesson__sidebar-lesson ${l.id === lid ? 'lesson__sidebar-lesson--active' : ''}`}
              >
                <span className="lesson__sidebar-lesson-num">{idx + 1}</span>
                <span className="lesson__sidebar-lesson-text">{l.title}</span>
              </Link>
            ))}
          </nav>
          {flatSteps.length > 0 && (
            <>
              <h3 className="lesson__sidebar-steps-title">{t('lesson.modulesTitle')}</h3>
              <ul className="lesson__sidebar-steps">
                {flatSteps.map((s, idx) => {
                  const um = s.underModule;
                  const completed = completedUnderModuleIds.has(um.id);
                  const isCurrent = um.id === currentStepId;
                  const locked = !s.access;
                  return (
                    <li key={um.id} className="lesson__sidebar-step-item">
                      <button
                        type="button"
                        className={`lesson__sidebar-step ${isCurrent ? 'lesson__sidebar-step--current' : ''} ${locked ? 'lesson__sidebar-step--locked' : ''} ${completed ? 'lesson__sidebar-step--done' : ''}`}
                        onClick={() => !locked && goToStep(idx)}
                        disabled={locked}
                      >
                        <span className="lesson__sidebar-step-num">{idx + 1}</span>
                        <span className="lesson__sidebar-step-title">{um.title}</span>
                        {completed && <span className="lesson__sidebar-step-check">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </aside>

        <main className="lesson__main">
          {loadingModules ? (
            <div className="lesson__step-loading">
              <Loader />
              <p>{t('common.loading')}</p>
            </div>
          ) : currentStep ? (
            <>
              <div className="lesson__step-header">
                <span className="lesson__step-type">
                  {STEP_TYPE_LABELS[currentStep.underModule?.type] || currentStep.underModule?.type}
                </span>
                <h1 className="lesson__step-title">{currentStep.underModule.title}</h1>
              </div>

              <Card className="lesson__step-card">
                <div className="lesson__step-content">
                  {currentStep.underModule?.type === 'test' ? (
                    (() => {
                      const um = currentStep.underModule;
                      const completed = completedUnderModuleIds.has(um.id);
                      const result = testResult || (lessonScoresDetail?.items && (() => {
                        const item = lessonScoresDetail.items.find((i) => i.underModuleId === um.id);
                        if (!item) return null;
                        const pct = item.maxScore > 0 ? Math.round((100 * (item.earnedScore ?? 0)) / item.maxScore) : 0;
                        return { score: item.earnedScore ?? 0, maxScore: item.maxScore, percent: pct, passed: pct >= 70 };
                      })());
                      if (completed && result) {
                        return (
                          <div className="lesson__test-result">
                            <h3 className="lesson__test-result-title">Результат теста</h3>
                            <p className="lesson__test-result-score">
                              Вы набрали <strong>{result.score}</strong> из <strong>{result.maxScore}</strong> ({result.percent}%)
                            </p>
                            <p className="lesson__test-result-rule">Для зачёта необходимо не менее 70% правильных ответов.</p>
                            <p className={`lesson__test-result-badge ${result.passed ? 'lesson__test-result-badge--passed' : 'lesson__test-result-badge--failed'}`}>
                              {result.passed ? 'Зачёт' : 'Не зачёт'}
                            </p>
                          </div>
                        );
                      }
                      if (testQuestions === null) {
                        return (
                          <div className="lesson__test-loading">
                            <Loader />
                            <p>{t('common.loading')}</p>
                          </div>
                        );
                      }
                      if (!testQuestions || testQuestions.length === 0) {
                        return (
                          <p className="lesson__content-empty">
                            В этом тесте пока нет вопросов. Обратитесь к преподавателю.
                          </p>
                        );
                      }
                      return (
                        <div className="lesson__test-block">
                          <p className="lesson__test-intro">Выберите один вариант ответа на каждый вопрос и нажмите «Отправить».</p>
                          <p className="lesson__test-pass-rule">Для зачёта нужно набрать не менее 70% правильных ответов от общего числа вопросов.</p>
                          <ol className="lesson__test-questions">
                            {testQuestions.map((q) => (
                              <li key={q.id} className="lesson__test-q">
                                <p className="lesson__test-q-text">{q.text}</p>
                                <ul className="lesson__test-options" role="radiogroup" aria-label={q.text}>
                                  {(q.answers ?? []).map((a) => (
                                    <li key={a.id} className="lesson__test-option">
                                      <label className="lesson__test-option-label">
                                        <input
                                          type="radio"
                                          name={`q-${q.id}`}
                                          checked={testAnswers[q.id] === a.id}
                                          onChange={() => setTestAnswers((prev) => ({ ...prev, [q.id]: a.id }))}
                                        />
                                        <span>{a.text}</span>
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ol>
                          <div className="lesson__step-actions">
                            <Button
                              variant="primary"
                              disabled={testSubmitting}
                              onClick={() => handleSubmitTest(um.id)}
                            >
                              {testSubmitting ? t('common.loading') : 'Отправить ответы'}
                            </Button>
                          </div>
                        </div>
                      );
                    })()
                  ) : currentStep.contentItems.length === 0 ? (
                    <p className="lesson__content-empty">{t('lesson.content')} — {t('common.none')}</p>
                  ) : (
                    currentStep.contentItems
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((item) => (
                        <div key={item.id} className="lesson__content-item">
                          {item.title && <h3>{item.title}</h3>}
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

                {currentStep.underModule?.type !== 'test' && (
                  <div className="lesson__step-actions">
                    {!completedUnderModuleIds.has(currentStep.underModule.id) && (
                      <Button
                        variant="primary"
                        disabled={!!completingId}
                        onClick={() => handleMarkComplete(currentStep.underModule.id)}
                      >
                        {completingId === currentStep.underModule.id ? t('common.loading') : t('lesson.markSubmoduleComplete')}
                      </Button>
                    )}
                  </div>
                )}
              </Card>

              <nav className="lesson__step-nav">
                {currentStepIndex > 0 ? (
                  <Button variant="outline" onClick={() => goToStep(currentStepIndex - 1)}>
                    ← {t('lesson.previousStep')}
                  </Button>
                ) : (
                  prevLesson ? (
                    <Link to={`/course/${courseId}/lesson/${prevLesson.id}`}>
                      <Button variant="outline">← {t('lesson.previousLesson')}</Button>
                    </Link>
                  ) : <span />
                )}
                {currentStepIndex < flatSteps.length - 1 ? (
                  <Button variant="primary" onClick={() => goToStep(currentStepIndex + 1)}>
                    {t('lesson.nextStep')} →
                  </Button>
                ) : (
                  nextLesson ? (
                    <Link to={`/course/${courseId}/lesson/${nextLesson.id}`}>
                      <Button variant="primary">{t('lesson.nextLesson')} →</Button>
                    </Link>
                  ) : (
                    <Link to={`/course/${courseId}`}>
                      <Button variant="primary">{t('lesson.backToCourse')}</Button>
                    </Link>
                  )
                )}
              </nav>
            </>
          ) : (
            <div className="lesson__step-empty">
              <p>{t('lesson.content')} — {t('common.none')}</p>
              <Link to={`/course/${courseId}`}><Button variant="outline">{t('lesson.backToCourse')}</Button></Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Lesson;
