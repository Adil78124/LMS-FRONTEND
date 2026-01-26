import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import ThemeToggle from '../UI/ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../UI/LanguageSwitcher/LanguageSwitcher';
import Button from '../UI/Button/Button';
import './Header.css';

const Header = () => {
  const { t } = useLanguage();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCartClick = () => {
    navigate('/cart');
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header__container container">
        <div className="header__left">
          <Link to="/" className="header__logo">
            <span className="header__logo-icon">📚</span>
            <span className="header__logo-text">EduPlatform</span>
          </Link>
          
          <nav className="header__nav">
            <Link 
              to="/" 
              className={`header__nav-link ${isActive('/') ? 'header__nav-link--active' : ''}`}
            >
              {t('nav.home')}
            </Link>
            <Link 
              to="/catalog" 
              className={`header__nav-link ${location.pathname.startsWith('/catalog') || location.pathname.startsWith('/my-courses') ? 'header__nav-link--active' : ''}`}
            >
              {t('nav.catalog')}
            </Link>
            <Link 
              to="/my-courses" 
              className={`header__nav-link ${isActive('/my-courses') ? 'header__nav-link--active' : ''}`}
            >
              {t('nav.myCourses')}
            </Link>
            <Link 
              to="/teaching" 
              className={`header__nav-link ${location.pathname.startsWith('/teaching') ? 'header__nav-link--active' : ''}`}
            >
              {t('nav.teaching')}
            </Link>
          </nav>
        </div>

        <div className="header__right">
          <div className="header__search">
            <input
              type="text"
              placeholder={t('common.search')}
              className="header__search-input"
            />
            <svg className="header__search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <ThemeToggle />
          <LanguageSwitcher />

          <button
            className="header__cart-btn"
            onClick={handleCartClick}
            aria-label={t('nav.cart')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 3h2l1 6h10l1-6H6M6 14h10M7 17h2M13 17h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {cartCount > 0 && <span className="header__cart-badge">{cartCount}</span>}
          </button>

          <button
            className="header__profile-btn"
            onClick={handleProfileClick}
            aria-label={t('nav.profile')}
          >
            <div className="header__avatar">
              <span>U</span>
            </div>
          </button>

          <button
            className="header__menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="header__mobile-menu">
          <nav className="header__mobile-nav">
            <Link to="/" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.home')}
            </Link>
            <Link to="/catalog" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.catalog')}
            </Link>
            <Link to="/my-courses" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.myCourses')}
            </Link>
            <Link to="/teaching" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.teaching')}
            </Link>
            <Link to="/profile" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.profile')}
            </Link>
            <Link to="/cart" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.cart')} ({cartCount})
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
