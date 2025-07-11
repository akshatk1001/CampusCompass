import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';

// Page imports
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import IdentityPage from './pages/IdentityPage';
import ResultsPage from './pages/ResultsPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';

import './styles/global.css';

function App() {
  return (
    <QuizProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/identity" element={<IdentityPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categorySlug" element={<CategoryPage />} />
        </Routes>
      </Router>
    </QuizProvider>
  );
}

export default App;
