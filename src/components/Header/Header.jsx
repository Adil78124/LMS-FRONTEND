import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { isStudentRole, isTeacherRole } from '../../utils/roles';
import ThemeToggle from '../UI/ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../UI/LanguageSwitcher/LanguageSwitcher';
import Button from '../UI/Button/Button';
import './Header.css';

const Header = () => {
  const { t } = useLanguage();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const role = user?.role;
  const showStudentNav = isStudentRole(role);
  const showTeacherNav = isTeacherRole(role);
  const showCatalog = !role || isStudentRole(role);

  const handleCartClick = () => {
    navigate('/cart');
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header__container container">
        <div className="header__left">
          <Link to={showTeacherNav ? '/teaching' : '/'} className="header__logo">
            <img src="/images/LMS-icons.png" alt="" className="header__logo-icon" />
          </Link>
          
          <nav className="header__nav">
            {!showTeacherNav && (
              <Link 
                to="/" 
                className={`header__nav-link ${isActive('/') ? 'header__nav-link--active' : ''}`}
              >
                {t('nav.home')}
              </Link>
            )}
            {showCatalog && (
              <Link 
                to="/catalog" 
                className={`header__nav-link ${location.pathname.startsWith('/catalog') || location.pathname.startsWith('/my-courses') ? 'header__nav-link--active' : ''}`}
              >
                {t('nav.catalog')}
              </Link>
            )}
            {showStudentNav && (
              <>
                <Link 
                  to="/my-courses" 
                  className={`header__nav-link ${isActive('/my-courses') ? 'header__nav-link--active' : ''}`}
                >
                  {t('nav.myCourses')}
                </Link>
                <Link 
                  to="/favorites" 
                  className={`header__nav-link ${isActive('/favorites') ? 'header__nav-link--active' : ''}`}
                >
                  {t('nav.favorites')}
                </Link>
              </>
            )}
            {showTeacherNav && (
              <>
                <Link 
                  to="/teaching" 
                  className={`header__nav-link ${location.pathname === '/teaching' ? 'header__nav-link--active' : ''}`}
                >
                  {t('teaching.myCoursesManage')}
                </Link>
                <Link 
                  to="/teaching/course/new" 
                  className={`header__nav-link ${location.pathname.startsWith('/teaching/course/new') || location.pathname.includes('/lessons') ? 'header__nav-link--active' : ''}`}
                >
                  {t('teaching.createCourse')}
                </Link>
                <Link 
                  to="/teaching/analytics" 
                  className={`header__nav-link ${location.pathname.startsWith('/teaching/analytics') ? 'header__nav-link--active' : ''}`}
                >
                  {t('nav.analytics')}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="header__right">
          {!showTeacherNav && (
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
          )}

          <span className="header__divider" aria-hidden />
          <ThemeToggle />
          <LanguageSwitcher />

          {showStudentNav && (
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
          )}

          {isAuthenticated ? (
            <>
              <button
                className="header__profile-btn"
                onClick={handleProfileClick}
                aria-label={t('nav.profile')}
              >
                <div className="header__avatar">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_BASE_URL || ''}${user.avatarUrl}`}
                      alt=""
                      className="header__avatar-img"
                    />
                  ) : (
                    <span>{user?.fullname?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
              </button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="header__logout-btn">
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <div className="header__auth-buttons">
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">{t('nav.signUp')}</Button>
              </Link>
            </div>
          )}

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
            {!showTeacherNav && (
              <Link to="/" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                {t('nav.home')}
              </Link>
            )}
            {showCatalog && (
              <Link to="/catalog" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                {t('nav.catalog')}
              </Link>
            )}
            {showStudentNav && (
              <>
                <Link to="/my-courses" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.myCourses')}
                </Link>
                <Link to="/favorites" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.favorites')}
                </Link>
              </>
            )}
            {showTeacherNav && (
              <>
                <Link to="/teaching" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('teaching.myCoursesManage')}
                </Link>
                <Link to="/teaching/course/new" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('teaching.createCourse')}
                </Link>
                <Link to="/teaching/analytics" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.analytics')}
                </Link>
              </>
            )}
            <Link to="/profile" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.profile')}
            </Link>
            {showStudentNav && (
              <button
                type="button"
                className="header__mobile-link header__mobile-link--btn"
                onClick={handleCartClick}
              >
                {t('nav.cart')} {cartCount > 0 && `(${cartCount})`}
              </button>
            )}
            {isAuthenticated ? (
              <button className="header__mobile-link header__mobile-link--btn" onClick={handleLogout}>
                {t('nav.signOut')}
              </button>
            ) : (
              <>
                <Link to="/login" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.signIn')}
                </Link>
                <Link to="/register" className="header__mobile-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.signUp')}
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
