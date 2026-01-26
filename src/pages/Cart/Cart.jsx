import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import * as cartService from '../../services/cartService';
import Card from '../../components/UI/Card/Card';
import Button from '../../components/UI/Button/Button';
import Modal from '../../components/UI/Modal/Modal';
import CheckoutForm from '../../components/CheckoutForm/CheckoutForm';
import './Cart.css';

const Cart = () => {
  const { t } = useLanguage();
  const { cartItems, removeFromCart, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (order) => {
    setOrderSuccess(order);
    clearCart();
    setShowCheckout(false);
    
    // Автоматически закрываем сообщение через 5 секунд
    setTimeout(() => {
      setOrderSuccess(null);
      navigate('/profile');
    }, 5000);
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <div className="container">
          <h1 className="cart__title">{t('cart.title')}</h1>
          <div className="cart__empty">
            <div className="cart__empty-icon">🛒</div>
            <h2 className="cart__empty-title">{t('cart.empty')}</h2>
            <p className="cart__empty-text">{t('cart.emptyDescription')}</p>
            <Link to="/catalog">
              <Button variant="primary" size="lg">
                {t('cart.continueShopping')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1 className="cart__title">{t('cart.title')}</h1>

        <div className="cart__layout">
          <main className="cart__main">
            <div className="cart__header">
              <h2 className="cart__items-title">{t('cart.itemsCount')} ({cartItems.length})</h2>
              <Button variant="ghost" size="sm" onClick={clearCart}>
                {t('cart.clearCart')}
              </Button>
            </div>

            <div className="cart__items">
              {cartItems.map((course) => (
                <Card key={course.id} className="cart__item">
                  <div className="cart__item-content">
                    <Link to={`/course/${course.id}`} className="cart__item-link">
                      <div className="cart__item-image">
                        <img 
                          src={course.image || `https://source.unsplash.com/120x80/?education,learning&sig=${course.id}`}
                          alt={course.title}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="cart__item-placeholder" style={{ display: 'none' }}>📚</div>
                      </div>
                      <div className="cart__item-info">
                        <h3 className="cart__item-title">{course.title}</h3>
                        <p className="cart__item-author">{t('course.author')}: {course.author}</p>
                        <div className="cart__item-meta">
                          <span>⭐ {course.rating}</span>
                          <span>{course.studentsCount}+ {t('course.students')}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="cart__item-actions">
                      <div className="cart__item-price">
                        {course.oldPrice && (
                          <span className="cart__item-price-old">{formatPrice(course.oldPrice)}</span>
                        )}
                        <span className="cart__item-price-current">
                          {course.currentPrice ? formatPrice(course.currentPrice) : t('catalog.free')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(course.id)}
                      >
                        {t('cart.remove')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </main>

          <aside className="cart__sidebar">
            <Card className="cart__summary">
              <h3 className="cart__summary-title">{t('cart.summary')}</h3>
              <div className="cart__summary-row">
                <span>{t('cart.coursesCount')}:</span>
                <span>{cartItems.length}</span>
              </div>
              <div className="cart__summary-row cart__summary-total">
                <span>{t('cart.total')}:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                className="cart__checkout-btn"
                disabled={cartItems.length === 0}
              >
                {t('cart.checkout')}
              </Button>
              <p className="cart__summary-note">
                {t('cart.paymentNote')}
              </p>
            </Card>
          </aside>
        </div>
      </div>

      {/* Модальное окно оформления заказа */}
      <Modal
        isOpen={showCheckout}
        onClose={handleCheckoutCancel}
        title={t('checkout.title')}
        className="checkout-modal"
      >
        <CheckoutForm
          cartItems={cartItems}
          cartTotal={cartTotal}
          onSuccess={handleCheckoutSuccess}
          onCancel={handleCheckoutCancel}
        />
      </Modal>

      {/* Сообщение об успешном оформлении заказа */}
      {orderSuccess && (
        <Modal
          isOpen={!!orderSuccess}
          onClose={() => {
            setOrderSuccess(null);
            navigate('/profile');
          }}
          title={t('checkout.successTitle')}
        >
          <div className="checkout-success">
            <div className="checkout-success__icon">✅</div>
            <h3 className="checkout-success__title">{t('checkout.successMessage')}</h3>
            <p className="checkout-success__text">
              {t('checkout.orderNumber')}: <strong>#{orderSuccess.id}</strong>
            </p>
            <p className="checkout-success__text">
              {t('checkout.total')}: <strong>
                {formatPrice(orderSuccess.total)}
              </strong>
            </p>
            <p className="checkout-success__note">
              {t('checkout.successNote')}
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setOrderSuccess(null);
                navigate('/profile');
              }}
            >
              {t('checkout.goToProfile')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Cart;
