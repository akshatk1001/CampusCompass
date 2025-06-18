import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useQuiz } from '../context/QuizContext';
import { CATEGORY_QUESTIONS } from '../data/questions';

function HomePage() {
  const { state, dispatch } = useQuiz();
  const categoryKeys = Object.keys(CATEGORY_QUESTIONS);

  const handleCategorySelection = (category) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: category });
  };

  const handleStartQuiz = () => {
    if (state.selectedCategories.length > 0) {
      dispatch({ type: 'START_QUIZ' });
    }
  };

  if (state.loading) {
    return (
      <Layout>
        <div className="loading-container">
          <h2>Loading club data...</h2>
        </div>
      </Layout>
    );
  }

  if (state.error) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Error: {state.error}</h2>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="survey-title">Select up to 3 categories you're interested in</h2>
      <div className="category-selection-container">
        <div className="category-selection">
          {categoryKeys.map((category) => (
            <button
              key={category}
              className={`category-button ${state.selectedCategories.includes(category) ? "selected" : ""}`}
              onClick={() => handleCategorySelection(category)}
              disabled={state.selectedCategories.length >= 3 && !state.selectedCategories.includes(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {state.selectedCategories.length > 0 && (
        <div className="selected-categories">
          <h3>Selected Categories:</h3>
          <ul>
            {state.selectedCategories.map((category, index) => (
              <li key={index}>{category}</li>
            ))}
          </ul>
        </div>
      )}

      <Link 
        to="/quiz" 
        className={`start-quiz-button ${state.selectedCategories.length === 0 ? 'disabled' : ''}`}
        onClick={handleStartQuiz}
        style={{ 
          pointerEvents: state.selectedCategories.length === 0 ? 'none' : 'auto',
          textDecoration: 'none'
        }}
      >
        Start Quiz
      </Link>
    </Layout>
  );
}

export default HomePage;
