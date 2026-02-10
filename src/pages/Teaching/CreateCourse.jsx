import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import { API_BASE_URL } from '../../config/api';
import Stepper from '../../components/Stepper/Stepper';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Loader from '../../components/UI/Loader/Loader';
import './CreateCourse.css';

const STEP_1 = 1;
const STEPS = ['Паспорт курса', 'Сборка курса'];

const INIT = {
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

const CreateCourse = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(INIT);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState('');
  const coverInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    categoryService
      .getAll()
      .then((data) => {
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const getCoverPreviewUrl = () => {
    if (!form.image) return null;
    if (form.image.startsWith('http')) return form.image;
    return `${API_BASE_URL || ''}${form.image}`;
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError('');
    setCoverUploading(true);
    try {
      const { path } = await courseService.uploadCover(file);
      setForm((prev) => ({ ...prev, image: path }));
    } catch (err) {
      setCoverError(err.message || 'Не удалось загрузить обложку');
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      setError('Введите название курса');
      return;
    }
    const catId = form.categoryId ? parseInt(form.categoryId, 10) : null;
    if (!catId || !categories.some((c) => c.id === catId)) {
      setError('Выберите категорию');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const course = await courseService.create({
        title: form.title.trim(),
        categoryId: catId,
        description: form.description?.trim() || undefined,
        fullDescription: form.fullDescription?.trim() || undefined,
        level: form.level || 'beginner',
        language: form.language || 'Русский',
        price: form.price ?? 0,
        status: form.status || 'draft',
        image: form.image?.trim() || undefined,
      });
      navigate(`/teaching/course/${course.id}/lessons`, { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка создания курса');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-course">
        <div className="container">
          <div className="create-course__loading">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  const stepsLabels = [t('teaching.step1Passport'), t('teaching.step2Assembly')];

  return (
    <div className="create-course">
      <div className="container">
        <div className="create-course__header">
          <h1 className="create-course__title">{t('teaching.createCourse')}</h1>
          <Stepper steps={stepsLabels} currentStep={STEP_1} />
        </div>

        <Card className="create-course__card">
          <form onSubmit={handleSubmit} className="create-course__form">
            {error && (
              <div className="create-course__error" role="alert">
                {error}
              </div>
            )}

            <div className="create-course__row">
              <label className="create-course__label" htmlFor="title">
                {t('teaching.courseTitle')} *
              </label>
              <input
                id="title"
                type="text"
                className="create-course__input"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Название курса"
                required
                maxLength={500}
              />
            </div>

            <div className="create-course__row">
              <label className="create-course__label">
                Обложка курса
              </label>
              <div className="create-course__cover">
                <input
                  ref={coverInputRef}
                  id="course-cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  disabled={coverUploading}
                  className="create-course__cover-input"
                />
                {getCoverPreviewUrl() ? (
                  <div className="create-course__cover-preview-wrap">
                    <img
                      src={getCoverPreviewUrl()}
                      alt="Обложка курса"
                      className="create-course__cover-preview"
                    />
                    <button
                      type="button"
                      className="create-course__cover-remove"
                      onClick={() => handleChange('image', '')}
                      aria-label="Удалить обложку"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label htmlFor="course-cover" className="create-course__cover-placeholder">
                    {coverUploading ? 'Загрузка…' : 'Выберите изображение через проводник'}
                  </label>
                )}
                {coverError && (
                  <p className="create-course__cover-error" role="alert">{coverError}</p>
                )}
              </div>
            </div>

            <div className="create-course__row">
              <label className="create-course__label" htmlFor="categoryId">
                {t('teaching.category')} *
              </label>
              <select
                id="categoryId"
                className="create-course__input create-course__select"
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                required
              >
                <option value="">— {t('common.all')} —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-course__row">
              <label className="create-course__label" htmlFor="description">
                {t('teaching.courseDescription')}
              </label>
              <textarea
                id="description"
                className="create-course__input create-course__textarea"
                rows={2}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Краткое описание"
                maxLength={1000}
              />
            </div>

            <div className="create-course__row">
              <label className="create-course__label" htmlFor="fullDescription">
                {t('teaching.fullDescription')}
              </label>
              <textarea
                id="fullDescription"
                className="create-course__input create-course__textarea"
                rows={4}
                value={form.fullDescription}
                onChange={(e) => handleChange('fullDescription', e.target.value)}
                placeholder="Полное описание курса"
                maxLength={5000}
              />
            </div>

            <div className="create-course__row create-course__row--inline">
              <div className="create-course__field">
                <label className="create-course__label" htmlFor="level">
                  {t('teaching.level')}
                </label>
                <select
                  id="level"
                  className="create-course__input create-course__select"
                  value={form.level}
                  onChange={(e) => handleChange('level', e.target.value)}
                >
                  <option value="beginner">{t('catalog.beginner')}</option>
                  <option value="intermediate">{t('catalog.intermediate')}</option>
                  <option value="advanced">{t('catalog.advanced')}</option>
                </select>
              </div>
              <div className="create-course__field">
                <label className="create-course__label" htmlFor="price">
                  {t('teaching.price')}
                </label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  className="create-course__input"
                  value={form.price === 0 ? '' : form.price}
                  onChange={(e) => handleChange('price', e.target.value ? parseInt(e.target.value, 10) : 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="create-course__row">
              <label className="create-course__label" htmlFor="status">
                {t('teaching.status')}
              </label>
              <select
                id="status"
                className="create-course__input create-course__select"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="draft">{t('teaching.draft')}</option>
                <option value="publish">{t('teaching.published')}</option>
                <option value="archived">{t('teaching.archived')}</option>
              </select>
              <p className="create-course__hint">
                Черновик — курс не виден в каталоге. Опубликованный — виден после сохранения.
              </p>
            </div>

            <div className="create-course__actions">
              <Button type="button" variant="ghost" onClick={() => navigate('/teaching')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? t('common.loading') : t('teaching.saveAndContinue')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCourse;
