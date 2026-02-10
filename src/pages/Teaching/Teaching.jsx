import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { lessonService } from '../../services/lessonService';
import { API_BASE_URL } from '../../config/api';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import Modal from '../../components/UI/Modal/Modal';
import './Teaching.css';

const COURSE_FORM_INIT = {
  title: '',
  categoryId: '',
  description: '',
  fullDescription: '',
  level: 'beginner',
  language: 'Русский',
  price: 0,
  status: 'draft',
  image: '',
};

const LESSON_FORM_INIT = {
  title: '',
  description: '',
  duration: 0,
  order: 0,
  type: 'theory',
};

const Teaching = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [editLessonOpen, setEditLessonOpen] = useState(false);

  const [courseForm, setCourseForm] = useState(COURSE_FORM_INIT);
  const [lessonForm, setLessonForm] = useState(LESSON_FORM_INIT);
  const [editingCourse, setEditingCourse] = useState(null);
  const [lessonCourseId, setLessonCourseId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const coverInputRefCreate = useRef(null);
  const coverInputRefEdit = useRef(null);

  const getCoverPreviewUrl = () => {
    if (!courseForm.image) return null;
    if (courseForm.image.startsWith('http')) return courseForm.image;
    return `${API_BASE_URL || ''}${courseForm.image}`;
  };
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError('');
    setCoverUploading(true);
    try {
      const { path } = await courseService.uploadCover(file);
      setCourseForm((p) => ({ ...p, image: path }));
    } catch (err) {
      setCoverError(err.message || 'Не удалось загрузить обложку');
    } finally {
      setCoverUploading(false);
      if (coverInputRefCreate.current) coverInputRefCreate.current.value = '';
      if (coverInputRefEdit.current) coverInputRefEdit.current.value = '';
    }
  };

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [coursesData, catsData] = await Promise.all([
        courseService.getMyCourses(),
        categoryService.getAll(),
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch {
      setCourses([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (location.state?.openCreate) {
      navigate('/teaching/course/new', { replace: true, state: {} });
    }
  }, [location.state?.openCreate, navigate]);

  const resetCourseForm = () => {
    setCourseForm(COURSE_FORM_INIT);
    setEditingCourse(null);
  };

  const resetLessonForm = () => {
    setLessonForm(LESSON_FORM_INIT);
    setLessonCourseId(null);
    setEditingLesson(null);
  };

  const handleOpenCreateCourse = () => {
    resetCourseForm();
    setCreateCourseOpen(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || '',
      categoryId: course.categoryId || '',
      description: course.description || '',
      fullDescription: course.fullDescription || '',
      level: course.level || 'beginner',
      language: course.language || 'Русский',
      price: course.price ?? course.currentPrice ?? 0,
      status: course.status || 'draft',
      image: course.image || '',
    });
    setEditCourseOpen(true);
  };

  const handleOpenAddLesson = (course) => {
    setLessonCourseId(course.id);
    setLessonForm({
      ...LESSON_FORM_INIT,
      order: (course.lessons?.length || 0) + 1,
    });
    setAddLessonOpen(true);
  };

  const handleOpenEditLesson = (lesson, course) => {
    setLessonCourseId(course.id);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      duration: lesson.duration || 0,
      order: lesson.order || 0,
      type: lesson.type || 'theory',
    });
    setEditLessonOpen(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.categoryId) {
      alert('Заполните название и категорию');
      return;
    }
    setSubmitting(true);
    try {
      const created = await courseService.create({
        title: courseForm.title,
        categoryId: parseInt(courseForm.categoryId, 10),
        description: courseForm.description || undefined,
        fullDescription: courseForm.fullDescription || undefined,
        level: courseForm.level,
        language: courseForm.language,
        price: parseInt(courseForm.price, 10) || 0,
        status: courseForm.status,
        image: courseForm.image?.trim() || undefined,
      });
      setCreateCourseOpen(false);
      resetCourseForm();
      await loadData();
      if (created?.id) navigate(`/course/${created.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse || !courseForm.title || !courseForm.categoryId) return;
    setSubmitting(true);
    try {
      await courseService.update(editingCourse.id, {
        title: courseForm.title,
        categoryId: parseInt(courseForm.categoryId, 10),
        description: courseForm.description || undefined,
        fullDescription: courseForm.fullDescription || undefined,
        level: courseForm.level,
        language: courseForm.language,
        price: parseInt(courseForm.price, 10) || 0,
        status: courseForm.status,
        image: courseForm.image?.trim() || undefined,
      });
      setEditCourseOpen(false);
      resetCourseForm();
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!lessonCourseId || !lessonForm.title) {
      alert('Заполните название урока');
      return;
    }
    setSubmitting(true);
    try {
      await lessonService.create(lessonCourseId, {
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        duration: parseInt(lessonForm.duration, 10) || 0,
        order: parseInt(lessonForm.order, 10) || 0,
        type: lessonForm.type,
      });
      setAddLessonOpen(false);
      resetLessonForm();
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    if (!editingLesson || !lessonForm.title) return;
    setSubmitting(true);
    try {
      await lessonService.update(editingLesson.id, {
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        duration: parseInt(lessonForm.duration, 10) || 0,
        order: parseInt(lessonForm.order, 10) || 0,
        type: lessonForm.type,
      });
      setEditLessonOpen(false);
      resetLessonForm();
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveCourse = async (course) => {
    if (!window.confirm(`Архивировать курс «${course.title}»?`)) return;
    try {
      await courseService.archive(course.id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCoursePermanent = async (course) => {
    if (!window.confirm(`Удалить курс «${course.title}» навсегда? Это действие нельзя отменить.`)) return;
    try {
      await courseService.deletePermanent(course.id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLesson = async (lesson, course) => {
    if (!window.confirm(`Удалить урок «${lesson.title}»?`)) return;
    try {
      await lessonService.delete(lesson.id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="teaching">
        <div className="container">
          <div className="teaching__auth-required">
            <p>{t('profile.authRequiredDesc')}</p>
            <Link to="/login">
              <Button variant="primary">{t('nav.signIn')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const FormInput = ({ label, name, value, onChange, type = 'text', required }) => (
    <div className="teaching__form-group">
      <label htmlFor={name} className="teaching__form-label">{label}</label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="teaching__form-input"
        required={required}
      />
    </div>
  );

  const FormSelect = ({ label, name, value, onChange, options }) => (
    <div className="teaching__form-group">
      <label htmlFor={name} className="teaching__form-label">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="teaching__form-input"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="teaching">
      <div className="container">
        <div className="teaching__header">
          <h1 className="teaching__title">{t('teaching.title')}</h1>
          <p className="teaching__subtitle">
            Создавайте и управляйте своими курсами. Зарабатывайте, делясь знаниями.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/teaching/course/new')}>
            {t('teaching.createCourse')}
          </Button>
        </div>

        <div className="teaching__stats">
          <Card className="teaching__stat-card">
            <div className="teaching__stat-value">{courses.length}</div>
            <div className="teaching__stat-label">{t('teaching.myCourses')}</div>
          </Card>
          <Card className="teaching__stat-card">
            <div className="teaching__stat-value">
              {courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0).toLocaleString()}
            </div>
            <div className="teaching__stat-label">{t('teaching.students')}</div>
          </Card>
          <Card className="teaching__stat-card">
            <div className="teaching__stat-value">
              {courses.reduce((sum, c) => sum + ((c.currentPrice ?? c.price ?? 0) * (c.studentsCount || 0) * 0.7), 0).toLocaleString()} ₸
            </div>
            <div className="teaching__stat-label">{t('teaching.earnings')}</div>
          </Card>
        </div>

        <div className="teaching__section">
          <div className="teaching__section-header">
            <h2 className="teaching__section-title">{t('teaching.myCourses')}</h2>
            <Button variant="outline" onClick={() => navigate('/teaching/course/new')}>
              + {t('teaching.createCourse')}
            </Button>
          </div>

          {loading ? (
            <div className="teaching__loading-inline">
              <Loader />
              <p>{t('common.loading')}</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="teaching__courses">
              {courses.map((course) => (
                <Card key={course.id} className="teaching__course-card" hoverable>
                  <div className="teaching__course-header">
                    <div className="teaching__course-info">
                      <h3 className="teaching__course-title">{course.title}</h3>
                      <p className="teaching__course-meta">
                        {course.studentsCount} {t('teaching.students')} • {course.rating} ⭐ •{' '}
                        {(course.currentPrice ?? course.price ?? 0) > 0 ? `${course.currentPrice ?? course.price} ₸` : t('catalog.free')}
                      </p>
                    </div>
                    <span className={`teaching__status-badge ${course.status === 'publish' ? 'published' : course.status === 'archived' ? 'archived' : 'draft'}`}>
                      {course.status === 'publish' ? t('teaching.published') : course.status === 'archived' ? t('teaching.archived') : t('teaching.draft')}
                    </span>
                  </div>

                  {course.lessons?.length > 0 && (
                    <div className="teaching__lessons-preview">
                      {course.lessons.map((lesson) => (
                        <div key={lesson.id} className="teaching__lesson-row">
                          <span>{lesson.order}. {lesson.title}</span>
                          <div className="teaching__lesson-actions">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenEditLesson(lesson, course)}>
                              {t('common.edit')}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(lesson, course)}>
                              {t('common.delete')}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="teaching__course-actions">
                    <Link to={`/teaching/course/${course.id}/lessons`}>
                      <Button variant="outline" size="sm">{t('teaching.viewCourse')}</Button>
                    </Link>
                    {course.status !== 'archived' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEditCourse(course)}>
                          {t('teaching.editCourse')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenAddLesson(course)}>
                          {t('teaching.addLesson')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleArchiveCourse(course)}>
                          {t('teaching.archiveCourse')}
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" className="teaching__delete-permanent" onClick={() => handleDeleteCoursePermanent(course)}>
                      {t('teaching.deletePermanent')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="teaching__empty">
              <div className="teaching__empty-icon">📚</div>
              <h3 className="teaching__empty-title">{t('teaching.noCourses')}</h3>
              <p className="teaching__empty-text">{t('teaching.createFirst')}</p>
              <Button variant="primary" size="lg" onClick={() => navigate('/teaching/course/new')}>
                {t('teaching.createCourse')}
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      <Modal
        isOpen={createCourseOpen}
        onClose={() => { setCreateCourseOpen(false); resetCourseForm(); }}
        title={t('teaching.createCourse')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateCourseOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleCreateCourse} disabled={submitting}>
              {submitting ? t('common.loading') : t('teaching.create')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCourse} className="teaching__form">
          <FormInput label={t('teaching.courseTitle')} name="title" value={courseForm.title} onChange={(v) => setCourseForm((p) => ({ ...p, title: v }))} required />
          <div className="teaching__form-group">
            <label className="teaching__form-label">Обложка курса</label>
            <div className="teaching__cover">
              <input ref={coverInputRefCreate} id="create-course-cover" type="file" accept="image/*" onChange={handleCoverChange} disabled={coverUploading} className="teaching__cover-input" />
              {getCoverPreviewUrl() ? (
                <div className="teaching__cover-preview-wrap">
                  <img src={getCoverPreviewUrl()} alt="Обложка" className="teaching__cover-preview" />
                  <button type="button" className="teaching__cover-remove" onClick={() => setCourseForm((p) => ({ ...p, image: '' }))} aria-label="Удалить обложку">×</button>
                </div>
              ) : (
                <label htmlFor="create-course-cover" className="teaching__cover-placeholder">{coverUploading ? 'Загрузка…' : 'Выберите изображение'}</label>
              )}
              {coverError && <p className="teaching__cover-error" role="alert">{coverError}</p>}
            </div>
          </div>
          <FormSelect
            label={t('teaching.category')}
            name="categoryId"
            value={courseForm.categoryId}
            onChange={(v) => setCourseForm((p) => ({ ...p, categoryId: v }))}
            options={[{ value: '', label: '—' }, ...categories.map((c) => ({ value: c.id, label: `${c.icon || ''} ${c.name}` }))]}
          />
          <FormInput label={t('teaching.courseDescription')} name="description" value={courseForm.description} onChange={(v) => setCourseForm((p) => ({ ...p, description: v }))} />
          <div className="teaching__form-group">
            <label className="teaching__form-label">{t('teaching.fullDescription')}</label>
            <textarea
              name="fullDescription"
              value={courseForm.fullDescription}
              onChange={(e) => setCourseForm((p) => ({ ...p, fullDescription: e.target.value }))}
              className="teaching__form-input"
              rows={4}
            />
          </div>
          <FormSelect
            label={t('teaching.level')}
            name="level"
            value={courseForm.level}
            onChange={(v) => setCourseForm((p) => ({ ...p, level: v }))}
            options={[
              { value: 'beginner', label: t('catalog.beginner') },
              { value: 'intermediate', label: t('catalog.intermediate') },
              { value: 'advanced', label: t('catalog.advanced') },
            ]}
          />
          <FormInput label={t('teaching.price')} name="price" value={courseForm.price} onChange={(v) => setCourseForm((p) => ({ ...p, price: v }))} type="number" />
          <FormSelect
            label={t('teaching.status')}
            name="status"
            value={courseForm.status}
            onChange={(v) => setCourseForm((p) => ({ ...p, status: v }))}
            options={[
              { value: 'draft', label: t('teaching.draft') },
              { value: 'publish', label: t('teaching.published') },
            ]}
          />
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal
        isOpen={editCourseOpen}
        onClose={() => { setEditCourseOpen(false); resetCourseForm(); }}
        title={t('teaching.editCourse')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditCourseOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleUpdateCourse} disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateCourse} className="teaching__form">
          <FormInput label={t('teaching.courseTitle')} name="title" value={courseForm.title} onChange={(v) => setCourseForm((p) => ({ ...p, title: v }))} required />
          <div className="teaching__form-group">
            <label className="teaching__form-label">Обложка курса</label>
            <div className="teaching__cover">
              <input ref={coverInputRefEdit} id="edit-course-cover" type="file" accept="image/*" onChange={handleCoverChange} disabled={coverUploading} className="teaching__cover-input" />
              {getCoverPreviewUrl() ? (
                <div className="teaching__cover-preview-wrap">
                  <img src={getCoverPreviewUrl()} alt="Обложка" className="teaching__cover-preview" />
                  <button type="button" className="teaching__cover-remove" onClick={() => setCourseForm((p) => ({ ...p, image: '' }))} aria-label="Удалить обложку">×</button>
                </div>
              ) : (
                <label htmlFor="edit-course-cover" className="teaching__cover-placeholder">{coverUploading ? 'Загрузка…' : 'Выберите изображение'}</label>
              )}
              {coverError && <p className="teaching__cover-error" role="alert">{coverError}</p>}
            </div>
          </div>
          <FormSelect
            label={t('teaching.category')}
            name="categoryId"
            value={courseForm.categoryId}
            onChange={(v) => setCourseForm((p) => ({ ...p, categoryId: v }))}
            options={[{ value: '', label: '—' }, ...categories.map((c) => ({ value: c.id, label: `${c.icon || ''} ${c.name}` }))]}
          />
          <FormInput label={t('teaching.courseDescription')} name="description" value={courseForm.description} onChange={(v) => setCourseForm((p) => ({ ...p, description: v }))} />
          <div className="teaching__form-group">
            <label className="teaching__form-label">{t('teaching.fullDescription')}</label>
            <textarea
              name="fullDescription"
              value={courseForm.fullDescription}
              onChange={(e) => setCourseForm((p) => ({ ...p, fullDescription: e.target.value }))}
              className="teaching__form-input"
              rows={4}
            />
          </div>
          <FormSelect
            label={t('teaching.level')}
            name="level"
            value={courseForm.level}
            onChange={(v) => setCourseForm((p) => ({ ...p, level: v }))}
            options={[
              { value: 'beginner', label: t('catalog.beginner') },
              { value: 'intermediate', label: t('catalog.intermediate') },
              { value: 'advanced', label: t('catalog.advanced') },
            ]}
          />
          <FormInput label={t('teaching.price')} name="price" value={courseForm.price} onChange={(v) => setCourseForm((p) => ({ ...p, price: v }))} type="number" />
          <FormSelect
            label={t('teaching.status')}
            name="status"
            value={courseForm.status}
            onChange={(v) => setCourseForm((p) => ({ ...p, status: v }))}
            options={[
              { value: 'draft', label: t('teaching.draft') },
              { value: 'publish', label: t('teaching.published') },
            ]}
          />
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        isOpen={addLessonOpen}
        onClose={() => { setAddLessonOpen(false); resetLessonForm(); }}
        title={t('teaching.addLesson')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddLessonOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleAddLesson} disabled={submitting}>
              {submitting ? t('common.loading') : t('teaching.create')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddLesson} className="teaching__form">
          <FormInput label={t('teaching.lessonTitle')} name="title" value={lessonForm.title} onChange={(v) => setLessonForm((p) => ({ ...p, title: v }))} required />
          <div className="teaching__form-group">
            <label className="teaching__form-label">{t('teaching.lessonDescription')}</label>
            <textarea
              name="description"
              value={lessonForm.description}
              onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))}
              className="teaching__form-input"
              rows={3}
            />
          </div>
          <FormInput label={t('teaching.lessonDuration')} name="duration" value={lessonForm.duration} onChange={(v) => setLessonForm((p) => ({ ...p, duration: v }))} type="number" />
          <FormInput label={t('teaching.lessonOrder')} name="order" value={lessonForm.order} onChange={(v) => setLessonForm((p) => ({ ...p, order: v }))} type="number" />
          <FormSelect
            label={t('teaching.lessonType')}
            name="type"
            value={lessonForm.type}
            onChange={(v) => setLessonForm((p) => ({ ...p, type: v }))}
            options={[
              { value: 'theory', label: t('teaching.typeTheory') },
              { value: 'practice', label: t('teaching.typePractice') },
              { value: 'test', label: t('teaching.typeTest') },
              { value: 'video', label: t('teaching.typeVideo') },
            ]}
          />
        </form>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal
        isOpen={editLessonOpen}
        onClose={() => { setEditLessonOpen(false); resetLessonForm(); }}
        title={t('teaching.editLesson')}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditLessonOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleUpdateLesson} disabled={submitting}>
              {submitting ? t('common.loading') : t('common.save')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateLesson} className="teaching__form">
          <FormInput label={t('teaching.lessonTitle')} name="title" value={lessonForm.title} onChange={(v) => setLessonForm((p) => ({ ...p, title: v }))} required />
          <div className="teaching__form-group">
            <label className="teaching__form-label">{t('teaching.lessonDescription')}</label>
            <textarea
              name="description"
              value={lessonForm.description}
              onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))}
              className="teaching__form-input"
              rows={3}
            />
          </div>
          <FormInput label={t('teaching.lessonDuration')} name="duration" value={lessonForm.duration} onChange={(v) => setLessonForm((p) => ({ ...p, duration: v }))} type="number" />
          <FormInput label={t('teaching.lessonOrder')} name="order" value={lessonForm.order} onChange={(v) => setLessonForm((p) => ({ ...p, order: v }))} type="number" />
          <FormSelect
            label={t('teaching.lessonType')}
            name="type"
            value={lessonForm.type}
            onChange={(v) => setLessonForm((p) => ({ ...p, type: v }))}
            options={[
              { value: 'theory', label: t('teaching.typeTheory') },
              { value: 'practice', label: t('teaching.typePractice') },
              { value: 'test', label: t('teaching.typeTest') },
              { value: 'video', label: t('teaching.typeVideo') },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
};

export default Teaching;
