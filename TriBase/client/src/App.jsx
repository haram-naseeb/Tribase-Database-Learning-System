import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModuleHome from './pages/ModuleHome';
import LessonView from './pages/LessonView';
import PracticeView from './pages/PracticeView';
import QuizView from './pages/QuizView';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import CertificateView from './pages/CertificateView';
import Landing from './pages/Landing';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Navbar hidden on auth pages and landing
const NO_NAV = ['/', '/login', '/register'];
const Layout = ({ children }) => {
  const loc = useLocation();
  const showNav = !NO_NAV.includes(loc.pathname);
  return <>{showNav && <Navbar />}{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-gray-200">
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/learn/:db" element={<PrivateRoute><ModuleHome /></PrivateRoute>} />
            <Route path="/learn/:db/lesson/:lessonId" element={<PrivateRoute><LessonView /></PrivateRoute>} />
            <Route path="/learn/:db/practice" element={<PrivateRoute><PracticeView /></PrivateRoute>} />
            <Route path="/learn/:db/quiz/:topicSlug" element={<PrivateRoute><QuizView /></PrivateRoute>} />
            <Route path="/certificate/:db" element={<PrivateRoute><CertificateView /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
