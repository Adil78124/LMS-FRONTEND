import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../UI/Button/Button';
import './CheckoutForm.css';

const CheckoutForm = ({ cartItems, cartTotal, onSuccess, onCancel }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    comment: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('checkout.errors.nameRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.errors.phoneRequired');
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = t('checkout.errors.phoneInvalid');
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('checkout.errors.emailInvalid');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('checkout.errors.addressRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Имитация отправки заказа
    // В реальном приложении здесь будет вызов API Supabase
    setTimeout(() => {
      // Сохраняем заказ в localStorage (для мокового режима)
      // При подключении Supabase используйте: import { createOrder } from '../../services/supabaseClient';
      
      const order = {
        id: Date.now(),
        orderNumber: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString(),
        items: cartItems.map(item => ({
          id: item.id,
          courseId: item.id,
          title: item.title,
          price: item.currentPrice,
          author: item.author,
        })),
        total: cartTotal,
        customer: formData,
        status: 'pending',
      };

      // Получаем существующие заказы
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));

      setIsSubmitting(false);
      onSuccess(order);
      
      /* 
      // Пример использования с Supabase:
      try {
        const user = await getCurrentUser();
        const order = await createOrder({
          userId: user.id,
          total: cartTotal,
          customer: formData,
          items: cartItems.map(item => ({
            courseId: item.id,
            title: item.title,
            price: item.currentPrice,
          })),
          clearCart: true,
        });
        onSuccess(order);
      } catch (error) {
        console.error('Error creating order:', error);
        alert('Ошибка при создании заказа');
      } finally {
        setIsSubmitting(false);
      }
      */
    }, 1000);
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-form__section">
        <h3 className="checkout-form__section-title">{t('checkout.customerInfo')}</h3>
        
        <div className="checkout-form__field">
          <label className="checkout-form__label">
            {t('checkout.name')} <span className="checkout-form__required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`checkout-form__input ${errors.name ? 'checkout-form__input--error' : ''}`}
            placeholder={t('checkout.namePlaceholder')}
          />
          {errors.name && <span className="checkout-form__error">{errors.name}</span>}
        </div>

        <div className="checkout-form__field">
          <label className="checkout-form__label">
            {t('checkout.phone')} <span className="checkout-form__required">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`checkout-form__input ${errors.phone ? 'checkout-form__input--error' : ''}`}
            placeholder={t('checkout.phonePlaceholder')}
          />
          {errors.phone && <span className="checkout-form__error">{errors.phone}</span>}
        </div>

        <div className="checkout-form__field">
          <label className="checkout-form__label">
            {t('checkout.email')} <span className="checkout-form__optional">({t('checkout.optional')})</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`checkout-form__input ${errors.email ? 'checkout-form__input--error' : ''}`}
            placeholder={t('checkout.emailPlaceholder')}
          />
          {errors.email && <span className="checkout-form__error">{errors.email}</span>}
        </div>
      </div>

      <div className="checkout-form__section">
        <h3 className="checkout-form__section-title">{t('checkout.deliveryInfo')}</h3>
        
        <div className="checkout-form__field">
          <label className="checkout-form__label">
            {t('checkout.address')} <span className="checkout-form__required">*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`checkout-form__textarea ${errors.address ? 'checkout-form__input--error' : ''}`}
            placeholder={t('checkout.addressPlaceholder')}
            rows="3"
          />
          {errors.address && <span className="checkout-form__error">{errors.address}</span>}
        </div>

        <div className="checkout-form__field">
          <label className="checkout-form__label">
            {t('checkout.comment')} <span className="checkout-form__optional">({t('checkout.optional')})</span>
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="checkout-form__textarea"
            placeholder={t('checkout.commentPlaceholder')}
            rows="3"
          />
        </div>
      </div>

      <div className="checkout-form__summary">
        <div className="checkout-form__summary-row">
          <span>{t('cart.total')}:</span>
          <span className="checkout-form__total">{new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'KZT',
            minimumFractionDigits: 0,
          }).format(cartTotal)}</span>
        </div>
      </div>

      <div className="checkout-form__actions">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {t('checkout.submit')}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;
