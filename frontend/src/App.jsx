import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { ProgressProvider } from './contexts/ProgressContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PageTransition from './components/PageTransition/PageTransition';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Lesson from './pages/Lesson/Lesson';
import Profile from './pages/Profile/Profile';
import Cart from './pages/Cart/Cart';
import Teaching from './pages/Teaching/Teaching';
import './App.css';

const AppRoutes = () => {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/course/:courseId/lesson/:lessonId" element={<Lesson />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-courses" element={<Catalog />} />
            <Route path="/teaching" element={<Teaching />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <ProgressProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ProgressProvider>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
