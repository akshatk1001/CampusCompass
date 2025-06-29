import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dropdown from '../components/Dropdown';
import { useQuiz } from '../context/QuizContext';
import { IDENTITY_QUESTIONS, IDENTITY_OPTIONS } from '../data/identity';
import { calcUserTagScores, applyCategoryInterestScores, rankClubsBySimilarity } from '../utils/quizUtils';

// Custom Style for the Custom Dropdown component
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#f0f8ff", // changing background color
    borderColor: state.isFocused ? "#2684FF" : "#ccc", //if focus use #2684FF (light blue) else use #ccc (grey)
    boxShadow: state.isFocused ? "0 0 0 1px #2684FF" : null, // subtle outline when focused
    "&:hover": { // on hover
      borderColor: state.isFocused ? "#2684FF" : "#00838f", // if focused keep #2684FF (light blue) else #00838f 
    },
  }),
  menu: (provided) => ({
    ...provided,
    maxHeight: '300px', // cap the height
    overflowY: 'auto', // make scrollable if options exceed max height
    zIndex: 9999, // bring to front
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#2684FF" : "#fff", // highlight on hover/focus
    color: state.isFocused ? "#fff" : "#333", // #fff (white) text when highlighted, else #333 (dark grey) 
    padding: 10, // extra padding
  }),
};

/**
 * IdentityPage component.
 *
 * Renders an optional identity‐question flow that can either:
 * 1. Ask the user if they want to answer identity questions, or
 * 2. Immediately compute results and navigate to the results page.
 *
 * - If the main survey isn’t complete, redirects to the home page and returns null.
 * - If the user opts out (“Skip”), computes and sets the top clubs, then navigates to /results.
 * - If the user opts in, walks through each identity question and finally navigates to /results.
 *
 * @component
 * 
 * @returns {JSX.Element} renders page to ask if user wants to complete identity questions
 * if yes is pressed, renderes logic for answers identiy questions, if skip is pressed, navigates to results page
 */
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

  // helper function for if identity questions are skipped
  const handleSkipIdentity = () => {
    finalizeScoresAndComputeClubs();
  };

  // helper function for if identity questions are not skipped
  const handleStartIdentity = () => {
    dispatch({ type: 'SET_SHOW_IDENTITY_QUESTIONS', payload: true });
  };

  // updates user identity vector. Goes to next question or computes score if end
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

  // handles logic for comparing user profile to club profile
  const finalizeScoresAndComputeClubs = (identityResponses = []) => {
    let tempUserTags = JSON.parse(JSON.stringify(state.userTags));
    tempUserTags = applyCategoryInterestScores(tempUserTags, state.selectedCategories);
    const finalScores = calcUserTagScores(tempUserTags);

    // Build the user category vector (40 tags)
    const userVector = [];
    for (let tagId = 1; tagId <= 40; tagId++) {
      userVector.push(finalScores[tagId] || 0);
    }

    // cosine similarity between user and clubs, set results in the context, then navigate to results page
    const topTen = rankClubsBySimilarity(userVector, state.clubData, identityResponses);
    dispatch({ type: 'SET_TOP_CLUBS', payload: topTen });
    dispatch({ type: 'COMPLETE_IDENTITY' });
    navigate('/results');
  };

  // render this for asking if user wants to answer identity questions
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

  // this is rendered after user selecting yes for if they want to answer identity questions
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
          disabled={!selectedOption} // must select an identity to proceed
        >
          {state.currentQuestionIndex >= questionsForIdentity.length - 1 ? 'Get My Results' : 'Next Question'}
        </button>
      </div>
    </Layout>
  );
}

export default IdentityPage;
