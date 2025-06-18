import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dropdown from '../components/Dropdown';
import { useQuiz } from '../context/QuizContext';
import { IDENTITY_QUESTIONS, IDENTITY_OPTIONS } from '../data/identity';
import { calcUserTagScores, applyCategoryInterestScores, rankClubsBySimilarity } from '../utils/quizUtils';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#f0f8ff",
    borderColor: state.isFocused ? "#2684FF" : "#ccc",
    boxShadow: state.isFocused ? "0 0 0 1px #2684FF" : null,
    "&:hover": {
      borderColor: state.isFocused ? "#2684FF" : "#00838f",
    },
  }),
  menu: (provided) => ({
    ...provided,
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#2684FF" : "#fff",
    color: state.isFocused ? "#fff" : "#333",
    padding: 10,
  }),
};

function IdentityPage() {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  // Redirect if survey isn't complete
  if (!state.surveyComplete) {
    navigate('/');
    return null;
  }

  const questionsForIdentity = IDENTITY_QUESTIONS["Identity"];
  const currentQuestion = questionsForIdentity[state.currentQuestionIndex];

  const handleSkipIdentity = () => {
    finalizeScoresAndComputeClubs();
  };

  const handleStartIdentity = () => {
    dispatch({ type: 'SET_SHOW_IDENTITY_QUESTIONS', payload: true });
  };

  const handleNext = () => {
    const value = selectedOption ? selectedOption.value : 'other';
    dispatch({ type: 'ADD_IDENTITY_RESPONSE', payload: value });
    
    if (state.currentQuestionIndex >= questionsForIdentity.length - 1) {
      // All identity questions answered
      const allResponses = [...state.userIdentityResponses, value];
      finalizeScoresAndComputeClubs(allResponses);
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
      setSelectedOption(null);
    }
  };

  const finalizeScoresAndComputeClubs = (identityResponses = []) => {
    let tempUserTags = JSON.parse(JSON.stringify(state.userTags));
    tempUserTags = applyCategoryInterestScores(tempUserTags, state.selectedCategories);
    const finalScores = calcUserTagScores(tempUserTags);

    // Build the user category vector (40 tags)
    const userVector = [];
    for (let tagId = 1; tagId <= 40; tagId++) {
      userVector.push(finalScores[tagId] || 0);
    }

    const topTen = rankClubsBySimilarity(userVector, state.clubData, identityResponses);
    dispatch({ type: 'SET_TOP_CLUBS', payload: topTen });
    dispatch({ type: 'COMPLETE_IDENTITY' });
    navigate('/results');
  };

  if (!state.showIdentityQuestions) {
    return (
      <Layout>
        <div className="question-block">
          <h2 className="category-name">Optional Identity Questions</h2>
          <p className="subcategory-question">
            Would you like to answer some identity-based questions to improve your matchmaking results?
          </p>
          <div className="answer-buttons">
            <button 
              className="answer-button yes-button"
              onClick={handleStartIdentity}
            >
              Yes, let's improve my matches
            </button>
            <button 
              className="answer-button no-button"
              onClick={handleSkipIdentity}
            >
              Skip to results
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((state.currentQuestionIndex + 1) / questionsForIdentity.length) * 100}%` }}></div>
      </div>
      
      <div className="question-block">
        <h2 className="category-name">
          Identity Questions 
          <span className="question-counter">
            ({state.currentQuestionIndex + 1} of {questionsForIdentity.length})
          </span>
        </h2>
        <h3 className="subcategory-question">{currentQuestion}</h3>
        
        <div className="dropdown-container">
          <Dropdown
            options={IDENTITY_OPTIONS[currentQuestion]}
            onChange={(option) => setSelectedOption(option)}
            value={selectedOption}
            placeholder="Select an option..."
            styles={customStyles}
            isSearchable
          />
        </div>
        
        <button 
          className="next-button"
          onClick={handleNext}
          disabled={!selectedOption}
        >
          {state.currentQuestionIndex >= questionsForIdentity.length - 1 ? 'Get My Results' : 'Next Question'}
        </button>
      </div>
    </Layout>
  );
}

export default IdentityPage;
