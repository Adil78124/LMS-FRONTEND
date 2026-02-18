import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { contentService } from '../../services/contentService';
import Stepper from '../../components/Stepper/Stepper';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import './CourseLessons.css';

const ASSIGNMENT_TYPES = [
  { value: 'introduction', key: 'typeIntroduction' },
  { value: 'theory', key: 'typeTheory' },
  { value: 'video', key: 'typeVideo' },
  { value: 'practice', key: 'typePractice' },
  { value: 'test', key: 'typeTest' },
];

const STEP_2 = 2;
const LESSON_INIT = { title: '', description: '', duration: 0, order: 0, type: 'theory' };
const UNDER_MODULE_INIT = { title: 'Задание', order: 0, type: 'theory', maxScore: 20 };

const CourseLessons = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(LESSON_INIT);
  const [submitting, setSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [modulesData, setModulesData] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [underMaterials, setUnderMaterials] = useState({});
  const [testQuestionsByUm, setTestQuestionsByUm] = useState({});

  const loadCourse = useCallback(async () => {
    if (!courseId) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await courseService.getById(courseId);
      setCourse(data);
      const list = Array.isArray(data.lessons) ? [...data.lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];
      setLessons(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
      return list;
    } catch (err) {
      setError(err.message);
      setCourse(null);
      setLessons([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const loadModules = useCallback(async () => {
    if (!selectedId) {
      setModulesData([]);
      setUnderMaterials({});
      return;
    }
    setLoadingModules(true);
    try {
      const modules = await contentService.getModules(selectedId);
      const list = Array.isArray(modules) ? modules : [];
      const materials = {};
      const withUnder = await Promise.all(
        list.map(async (mod) => {
          const under = await contentService.getUnderModules(mod.id).catch(() => []);
          const underArr = Array.isArray(under) ? under : [];
          const underWithContent = await Promise.all(
            underArr.map(async (um) => {
              const content = await contentService.getContent(um.id).catch(() => []);
              const items = Array.isArray(content) ? content : [];
              const first = items[0] || null;
              materials[um.id] = {
                contentId: first?.id ?? null,
                text: first?.text ?? '',
                video: first?.video ?? '',
              };
              return um;
            }),
          );
          return { module: mod, underModules: underWithContent };
        }),
      );
      setModulesData(withUnder);
      setUnderMaterials(materials);
      const testData = {};
      for (const { underModules } of withUnder) {
        for (const um of underModules) {
          if (um.type === 'test') {
            try {
              const res = await contentService.getTestQuestions(um.id);
              testData[um.id] = res.questions ?? [];
            } catch {
              testData[um.id] = [];
            }
          }
        }
      }
      setTestQuestionsByUm(testData);
    } catch {
      setModulesData([]);
      setUnderMaterials({});
      setTestQuestionsByUm({});
    } finally {
      setLoadingModules(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  useEffect(() => {
    if (!selectedId || lessons.length === 0) {
      setForm(LESSON_INIT);
      return;
    }
    const lesson = lessons.find((l) => l.id === selectedId);
    if (lesson) {
      setForm({
        title: lesson.title || '',
        description: lesson.description || '',
        duration: lesson.duration ?? 0,
        order: lesson.order ?? 0,
        type: lesson.type || 'theory',
      });
    }
  }, [selectedId, lessons]);

  const handleAddLesson = async () => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      const newLesson = await lessonService.create(courseId, {
        title: 'Новый урок',
        description: '',
        duration: 0,
        order: lessons.length + 1,
        type: 'theory',
      });
      await loadCourse();
      if (newLesson?.id) setSelectedId(newLesson.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm(t('common.delete') + '?')) return;
    try {
      await lessonService.delete(lessonId);
      if (selectedId === lessonId) setSelectedId(null);
      const nextList = await loadCourse();
      if (nextList.length > 0) setSelectedId(nextList[0].id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await lessonService.update(selectedId, {
        title: form.title || 'Урок',
        description: form.description || undefined,
        duration: form.duration ?? 0,
        order: form.order ?? 0,
        type: form.type || 'theory',
      });
      await loadCourse();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleAddModule = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await contentService.createModule(selectedId, {
        title: `Модуль ${modulesData.length + 1}`,
        order: modulesData.length,
      });
      await loadModules();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUnderModule = async (moduleId) => {
    setSubmitting(true);
    try {
      const mod = modulesData.find((d) => d.module.id === moduleId);
      const nextOrder = mod ? mod.underModules.length : 0;
      await contentService.createUnderModule(moduleId, {
        title: t('teaching.typeTheory'),
        order: nextOrder,
        type: 'theory',
        maxScore: 20,
      });
      await loadModules();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUnderModule = async (underModuleId, patch) => {
    try {
      await contentService.updateUnderModule(underModuleId, patch);
      await loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUnderModule = async (underModuleId) => {
    if (!window.confirm(t('common.delete') + '?')) return;
    try {
      await contentService.deleteUnderModule(underModuleId);
      await loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm(t('common.delete') + '?')) return;
    try {
      await contentService.deleteModule(moduleId);
      await loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMaterialChange = (underModuleId, patch) => {
    setUnderMaterials((prev) => {
      const current = prev[underModuleId] || { contentId: null, text: '', video: '' };
      return {
        ...prev,
        [underModuleId]: { ...current, ...patch },
      };
    });
  };

  const handleSaveMaterial = async (um, type, override = null) => {
    const current = underMaterials[um.id] || { contentId: null, text: '', video: '' };
    const isVideo = type === 'video';
    const text = isVideo ? '' : ((override?.text ?? current.text) || '');
    const video = isVideo ? ((override?.video ?? current.video) || '') : '';
    if (!text && !video) return;
    try {
      if (!current.contentId) {
        const created = await contentService.createContent(um.id, {
          title: um.title || 'Материал',
          text: text || null,
          video: video || null,
          order: 0,
        });
        setUnderMaterials((prev) => ({
          ...prev,
          [um.id]: { ...current, contentId: created.id },
        }));
      } else {
        await contentService.updateContent(current.contentId, {
          text: text || null,
          video: video || null,
        });
      }
      // перезагрузим модули, чтобы в Lesson всё было консистентно
      await loadModules();
    } catch (err) {
      alert(err.message);
    }
  };

  const addTestQuestion = async (underModuleId) => {
    try {
      const created = await contentService.createTestQuestion(underModuleId, { text: 'Новый вопрос', order: (testQuestionsByUm[underModuleId]?.length ?? 0) });
      setTestQuestionsByUm((prev) => ({
        ...prev,
        [underModuleId]: [...(prev[underModuleId] ?? []), { ...created, answers: [] }],
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const updateTestQuestion = async (underModuleId, questionId, patch) => {
    try {
      await contentService.updateTestQuestion(questionId, patch);
      setTestQuestionsByUm((prev) => {
        const list = prev[underModuleId] ?? [];
        return {
          ...prev,
          [underModuleId]: list.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTestQuestion = async (underModuleId, questionId) => {
    try {
      await contentService.deleteTestQuestion(questionId);
      setTestQuestionsByUm((prev) => ({
        ...prev,
        [underModuleId]: (prev[underModuleId] ?? []).filter((q) => q.id !== questionId),
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const addTestAnswer = async (underModuleId, questionId) => {
    try {
      const created = await contentService.createTestAnswer(questionId, { text: 'Вариант ответа', isCorrect: false });
      setTestQuestionsByUm((prev) => {
        const list = prev[underModuleId] ?? [];
        return {
          ...prev,
          [underModuleId]: list.map((q) =>
            q.id === questionId ? { ...q, answers: [...(q.answers ?? []), { ...created, isCorrect: false }] } : q
          ),
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const updateTestAnswer = async (underModuleId, questionId, answerId, patch) => {
    try {
      await contentService.updateTestAnswer(answerId, patch);
      setTestQuestionsByUm((prev) => {
        const list = prev[underModuleId] ?? [];
        return {
          ...prev,
          [underModuleId]: list.map((q) =>
            q.id === questionId
              ? { ...q, answers: (q.answers ?? []).map((a) => (a.id === answerId ? { ...a, ...patch } : a)) }
              : q
          ),
        };
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTestAnswer = async (underModuleId, questionId, answerId) => {
    try {
      await contentService.deleteTestAnswer(answerId);
      setTestQuestionsByUm((prev) => ({
        ...prev,
        [underModuleId]: (prev[underModuleId] ?? []).map((q) =>
          q.id === questionId ? { ...q, answers: (q.answers ?? []).filter((a) => a.id !== answerId) } : q
        ),
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = draggedIndex;
    if (fromIndex == null || fromIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    const reordered = [...lessons];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, removed);
    setLessons(reordered);
    setDraggedIndex(null);
    for (let i = 0; i < reordered.length; i++) {
      const lesson = reordered[i];
      const newOrder = i + 1;
      if ((lesson.order ?? 0) !== newOrder) {
        try {
          await lessonService.update(lesson.id, { order: newOrder });
        } catch {
          await loadCourse();
          return;
        }
      }
    }
    await loadCourse();
  };

  if (loading && !course) {
    return (
      <div className="course-lessons">
        <div className="container">
          <div className="course-lessons__loading">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-lessons">
        <div className="container">
          <Card className="course-lessons__error">
            <p>{error || t('course.notFound')}</p>
            <Button variant="primary" onClick={() => navigate('/teaching')}>
              {t('teaching.myCoursesManage')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const stepsLabels = [t('teaching.step1Passport'), t('teaching.step2Assembly')];
  const selectedLesson = lessons.find((l) => l.id === selectedId);

  return (
    <div className="course-lessons">
      <div className="container">
        <div className="course-lessons__header">
          <h1 className="course-lessons__title">{course.title} — {t('teaching.step2Assembly')}</h1>
          <Stepper steps={stepsLabels} currentStep={STEP_2} />
        </div>

        <div className="course-lessons__toolbar">
          <Button variant="primary" size="sm" onClick={handleAddLesson} disabled={submitting}>
            {t('teaching.addLesson')}
          </Button>
          <p className="course-lessons__hint">{t('teaching.dragToReorder')}</p>
        </div>

        <div className="course-lessons__layout">
          <aside className="course-lessons__sidebar">
            <Card className="course-lessons__list-card">
              <h3 className="course-lessons__list-title">{t('teaching.lessonTitle')} ({lessons.length})</h3>
              {lessons.length === 0 ? (
                <p className="course-lessons__empty">{t('teaching.noLessonsYet')}</p>
              ) : (
                <ul className="course-lessons__list">
                  {lessons.map((lesson, index) => (
                    <li
                      key={lesson.id}
                      className={`course-lessons__list-item ${selectedId === lesson.id ? 'course-lessons__list-item--active' : ''} ${draggedIndex === index ? 'course-lessons__list-item--dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={() => setSelectedId(lesson.id)}
                    >
                      <span className="course-lessons__list-num">{lesson.order}</span>
                      <span className="course-lessons__list-label">{lesson.title || 'Без названия'}</span>
                      <button
                        type="button"
                        className="course-lessons__list-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        title={t('teaching.deleteLesson')}
                        aria-label={t('teaching.deleteLesson')}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>

          <main className="course-lessons__editor">
            <Card className="course-lessons__editor-card">
              {selectedLesson ? (
                <form onSubmit={handleSaveLesson} className="course-lessons__form">
                  <h3 className="course-lessons__form-title">{t('teaching.editLesson')}</h3>
                  <div className="course-lessons__row">
                    <label className="course-lessons__label">{t('teaching.lessonTitle')}</label>
                    <input
                      type="text"
                      className="course-lessons__input"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      required
                      maxLength={500}
                    />
                  </div>
                  <div className="course-lessons__row">
                    <label className="course-lessons__label">{t('teaching.lessonDescription')}</label>
                    <textarea
                      className="course-lessons__input course-lessons__textarea"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      maxLength={2000}
                    />
                  </div>
                  <div className="course-lessons__row course-lessons__row--inline">
                    <div className="course-lessons__field">
                      <label className="course-lessons__label">{t('teaching.lessonDuration')}</label>
                      <input
                        type="number"
                        min={0}
                        className="course-lessons__input"
                        value={form.duration}
                        onChange={(e) => setForm((p) => ({ ...p, duration: parseInt(e.target.value, 10) || 0 }))}
                      />
                    </div>
                    <div className="course-lessons__field">
                      <label className="course-lessons__label">{t('teaching.lessonType')}</label>
                      <select
                        className="course-lessons__input course-lessons__select"
                        value={form.type}
                        onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      >
                        <option value="introduction">{t('teaching.typeIntroduction')}</option>
                        <option value="theory">{t('teaching.typeTheory')}</option>
                        <option value="video">{t('teaching.typeVideo')}</option>
                        <option value="practice">{t('teaching.typePractice')}</option>
                        <option value="test">{t('teaching.typeTest')}</option>
                      </select>
                    </div>
                    <div className="course-lessons__field">
                      <label className="course-lessons__label">{t('teaching.lessonOrder')}</label>
                      <input
                        type="number"
                        min={1}
                        className="course-lessons__input"
                        value={form.order}
                        onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value, 10) || 1 }))}
                      />
                    </div>
                  </div>
                  <div className="course-lessons__actions">
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? t('common.loading') : t('common.save')}
                    </Button>
                  </div>

                  <div className="course-lessons__content-section">
                    <h3 className="course-lessons__content-title">{t('teaching.lessonContent')}</h3>
                    <p className="course-lessons__content-hint">
                      Добавьте модули и задания. Для каждого задания выберите тип (Введение, Теория, Видео, Практика, Тест) — название в содержании урока обновится. Введите текст материала и нажмите «Сохранить», иначе он не попадёт в урок. Урок засчитывается при ≥70% баллов.
                    </p>
                    {loadingModules ? (
                      <Loader />
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddModule}
                          disabled={submitting}
                          className="course-lessons__add-module-btn"
                        >
                          {t('teaching.addModule')}
                        </Button>
                        {modulesData.map(({ module: mod, underModules }) => (
                          <div key={mod.id} className="course-lessons__module-block">
                            <div className="course-lessons__module-head">
                              <span className="course-lessons__module-title">{mod.title}</span>
                              <button
                                type="button"
                                className="course-lessons__list-delete"
                                onClick={() => handleDeleteModule(mod.id)}
                                title={t('common.delete')}
                              >
                                ✕
                              </button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddUnderModule(mod.id)}
                              disabled={submitting}
                              className="course-lessons__add-under-btn"
                            >
                              {t('teaching.addUnderModule')}
                            </Button>
                            {underModules
                              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                              .map((um) => (
                                <div key={um.id} className="course-lessons__under-row">
                                  <span className="course-lessons__under-title">{um.title}</span>
                                  <select
                                    className="course-lessons__input course-lessons__select course-lessons__under-select"
                                    value={um.type || 'theory'}
                                    onChange={(e) => {
                                      const newType = e.target.value;
                                      const opt = ASSIGNMENT_TYPES.find((o) => o.value === newType);
                                      const newTitle = opt ? t(`teaching.${opt.key}`) : um.title;
                                      handleUpdateUnderModule(um.id, {
                                        type: newType,
                                        title: newTitle,
                                      });
                                    }}
                                  >
                                    {ASSIGNMENT_TYPES.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {t(`teaching.${opt.key}`)}
                                      </option>
                                    ))}
                                  </select>
                                  <label className="course-lessons__under-label">
                                    {t('teaching.maxScore')}
                                    <input
                                      type="number"
                                      min={0}
                                      className="course-lessons__input course-lessons__under-score"
                                      value={um.maxScore ?? 20}
                                      onChange={(e) => {
                                        const v = parseInt(e.target.value, 10);
                                        if (!Number.isNaN(v) && v >= 0)
                                          handleUpdateUnderModule(um.id, { maxScore: v });
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    className="course-lessons__list-delete"
                                    onClick={() => handleDeleteUnderModule(um.id)}
                                    title={t('common.delete')}
                                  >
                                    ✕
                                  </button>
                                  <div className="course-lessons__under-material">
                                    {(() => {
                                      const mat = underMaterials[um.id] || { text: '', video: '' };
                                      if (um.type === 'video') {
                                        return (
                                          <>
                                            <label className="course-lessons__label">
                                              Видео (загрузка через проводник)
                                              <input
                                                type="file"
                                                accept="video/*"
                                                className="course-lessons__input"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (!file) return;
                                                  try {
                                                    const uploaded = await contentService.uploadVideo(file);
                                                    handleMaterialChange(um.id, { video: uploaded.path });
                                                    await handleSaveMaterial(um, 'video', { video: uploaded.path });
                                                  } catch (err) {
                                                    alert(err.message);
                                                  } finally {
                                                    e.target.value = '';
                                                  }
                                                }}
                                              />
                                            </label>
                                            {mat.video ? (
                                              <div className="course-lessons__content-hint">
                                                Загружено: <code>{mat.video}</code>
                                              </div>
                                            ) : null}
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={() => handleSaveMaterial(um, um.type)}
                                              disabled={submitting}
                                            >
                                              {t('common.save')}
                                            </Button>
                                          </>
                                        );
                                      }
                                      if (um.type === 'test') {
                                        const questions = testQuestionsByUm[um.id] ?? [];
                                        return (
                                          <div className="course-lessons__test-editor">
                                            <div className="course-lessons__test-head">
                                              <span className="course-lessons__label">Вопросы теста</span>
                                              <Button
                                                type="button"
                                                size="sm"
                                                variant="primary"
                                                onClick={() => addTestQuestion(um.id)}
                                                disabled={submitting}
                                              >
                                                + Добавить вопрос
                                              </Button>
                                            </div>
                                            {questions.length === 0 ? (
                                              <p className="course-lessons__test-empty">
                                                Нет вопросов. Нажмите «Добавить вопрос» и укажите варианты ответов; отметьте один правильный для каждого вопроса.
                                              </p>
                                            ) : (
                                              <ul className="course-lessons__test-list">
                                                {questions.map((q, qIdx) => (
                                                  <li key={q.id} className="course-lessons__test-question">
                                                    <div className="course-lessons__test-q-row">
                                                      <input
                                                        type="text"
                                                        className="course-lessons__input course-lessons__test-q-input"
                                                        placeholder="Текст вопроса"
                                                        value={q.text || ''}
                                                        onChange={(e) =>
                                                          updateTestQuestion(um.id, q.id, {
                                                            text: e.target.value,
                                                          })
                                                        }
                                                      />
                                                      <button
                                                        type="button"
                                                        className="course-lessons__list-delete"
                                                        onClick={() => deleteTestQuestion(um.id, q.id)}
                                                        title={t('common.delete')}
                                                      >
                                                        ✕
                                                      </button>
                                                    </div>
                                                    <div className="course-lessons__test-answers">
                                                      {(q.answers ?? []).map((a) => (
                                                        <div key={a.id} className="course-lessons__test-answer-row">
                                                          <label className="course-lessons__test-answer-check">
                                                            <input
                                                              type="radio"
                                                              name={`correct-${q.id}`}
                                                              checked={!!a.isCorrect}
                                                              onChange={() => {
                                                                updateTestAnswer(um.id, q.id, a.id, {
                                                                  isCorrect: true,
                                                                });
                                                                (q.answers ?? []).filter((aa) => aa.id !== a.id).forEach((aa) => {
                                                                  updateTestAnswer(um.id, q.id, aa.id, {
                                                                    isCorrect: false,
                                                                  });
                                                                });
                                                              }}
                                                            />
                                                            <span>Правильный</span>
                                                          </label>
                                                          <input
                                                            type="text"
                                                            className="course-lessons__input course-lessons__test-a-input"
                                                            placeholder="Вариант ответа"
                                                            value={a.text || ''}
                                                            onChange={(e) =>
                                                              updateTestAnswer(um.id, q.id, a.id, {
                                                                text: e.target.value,
                                                              })
                                                            }
                                                          />
                                                          <button
                                                            type="button"
                                                            className="course-lessons__list-delete"
                                                            onClick={() => deleteTestAnswer(um.id, q.id, a.id)}
                                                            title={t('common.delete')}
                                                          >
                                                            ✕
                                                          </button>
                                                        </div>
                                                      ))}
                                                      <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => addTestAnswer(um.id, q.id)}
                                                        disabled={submitting}
                                                      >
                                                        + Вариант ответа
                                                      </Button>
                                                    </div>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}
                                          </div>
                                        );
                                      }
                                      return (
                                        <>
                                          <label className="course-lessons__label">
                                            Материал
                                            <textarea
                                              className="course-lessons__input course-lessons__textarea"
                                              rows={3}
                                              placeholder="Введите текст материала"
                                              value={mat.text}
                                              onChange={(e) =>
                                                handleMaterialChange(um.id, { text: e.target.value })
                                              }
                                            />
                                          </label>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSaveMaterial(um, um.type)}
                                            disabled={submitting}
                                          >
                                            {t('common.save')}
                                          </Button>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </form>
              ) : (
                <div className="course-lessons__placeholder">
                  <p className="course-lessons__placeholder-text">{t('teaching.selectLesson')}</p>
                  <Button variant="outline" onClick={handleAddLesson} disabled={submitting}>
                    {t('teaching.addLesson')}
                  </Button>
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourseLessons;
