import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PageTransition from './components/PageTransition/PageTransition';
import { StudentOrGuestOnly, TeacherOnly } from './components/RoleGuard/RoleGuard';
import Home from './pages/Home/Home';
import Catalog from './pages/Catalog/Catalog';
import CourseDetail from './pages/CourseDetail/CourseDetail';
import Lesson from './pages/Lesson/Lesson';
import Profile from './pages/Profile/Profile';
import Cart from './pages/Cart/Cart';
import Teaching from './pages/Teaching/Teaching';
import Analytics from './pages/Teaching/Analytics';
import CreateCourse from './pages/Teaching/CreateCourse';
import CourseLessons from './pages/Teaching/CourseLessons';
import Favorites from './pages/Favorites/Favorites';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import './App.css';

const AppRoutes = () => {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<StudentOrGuestOnly><Catalog /></StudentOrGuestOnly>} />
            <Route path="/course/:id" element={<StudentOrGuestOnly><CourseDetail /></StudentOrGuestOnly>} />
            <Route path="/course/:courseId/lesson/:lessonId" element={<StudentOrGuestOnly><Lesson /></StudentOrGuestOnly>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<StudentOrGuestOnly><Cart /></StudentOrGuestOnly>} />
            <Route path="/my-courses" element={<StudentOrGuestOnly><Catalog /></StudentOrGuestOnly>} />
            <Route path="/favorites" element={<StudentOrGuestOnly><Favorites /></StudentOrGuestOnly>} />
            <Route path="/teaching" element={<TeacherOnly><Teaching /></TeacherOnly>} />
            <Route path="/teaching/course/new" element={<TeacherOnly><CreateCourse /></TeacherOnly>} />
            <Route path="/teaching/course/:id/lessons" element={<TeacherOnly><CourseLessons /></TeacherOnly>} />
            <Route path="/teaching/analytics" element={<TeacherOnly><Analytics /></TeacherOnly>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
        <AuthProvider>
          <CartProvider>
            <ProgressProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ProgressProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
