import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useQuiz } from '../context/QuizContext';
import { CATEGORY_QUESTIONS } from '../data/questions';

function QuizPage() {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();

  // Redirect if quiz hasn't been started
  if (!state.quizStarted || state.selectedCategories.length === 0) {
    navigate('/');
    return null;
  }

  const categoryName = state.selectedCategories[state.currentCategoryIndex];
  const questionsForCategory = CATEGORY_QUESTIONS[categoryName];
  const currentQuestion = questionsForCategory[state.currentQuestionIndex];

  const handleAnswer = (tagIds, answeredYes) => {
    const numericAnswer = answeredYes ? 1 : 0;
    const updatedTags = { ...state.userTags };
    
    tagIds.forEach(tid => {
      updatedTags[tid] = [...updatedTags[tid], numericAnswer];
    });

    dispatch({ type: 'UPDATE_USER_TAGS', payload: updatedTags });

    // Check if this is the last question in the category
    if (state.currentQuestionIndex === questionsForCategory.length - 1) {
      // Check if this is the last category
      if (state.currentCategoryIndex < state.selectedCategories.length - 1) {
        dispatch({ type: 'NEXT_CATEGORY' });
      } else {
        // End of all categories
        dispatch({ type: 'COMPLETE_SURVEY' });
        navigate('/identity');
      }
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  const progressPercentage = ((state.currentCategoryIndex * 7 + state.currentQuestionIndex + 1) / (state.selectedCategories.length * 7)) * 100;

  return (
    <Layout>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>
      
      <div className="question-block">
        <h3 className="category-name">
          {categoryName} 
          <span className="question-counter">
            ({state.currentQuestionIndex + 1} of {questionsForCategory.length})
          </span>
        </h3>
        <h2 className="subcategory-question">{currentQuestion[0]}</h2>
        
        <div className="answer-buttons">
          <button 
            className="answer-button yes-button"
            onClick={() => handleAnswer(currentQuestion[1], true)}
          >
            Yes
          </button>
          <button 
            className="answer-button no-button"
            onClick={() => handleAnswer(currentQuestion[1], false)}
          >
            No
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default QuizPage;
