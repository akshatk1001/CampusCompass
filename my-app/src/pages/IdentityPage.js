// React is the main library - we need this in every component file
// useState is a special hook that lets us store and update data in this component
import React, { useState } from 'react';
// useNavigate lets us programmatically move to different pages (like clicking a link in code)
import { useNavigate } from 'react-router-dom';
// Layout is our custom component that wraps the page with header/navigation
import Layout from '../components/Layout';
// Dropdown is our custom component for selection dropdowns (like choosing from a list)
import Dropdown from '../components/Dropdown';
// useQuiz is our custom hook that gives us access to quiz data from anywhere in the app
import { useQuiz } from '../context/QuizContext';
// These contain the identity questions and their possible answer options
import { IDENTITY_QUESTIONS, IDENTITY_OPTIONS } from '../data/identity';
// These are utility functions that do complex calculations for club matching
import { calcUserTagScores, applyCategoryInterestScores, rankClubsBySimilarity } from '../utils/quizUtils';
// Import the CSS styles for this specific page
import './IdentityPage.css';

/**
 * IdentityPage Component
 * 
 * This is the second step in our quiz flow - OPTIONAL identity questions.
 * 
 * What this page does:
 * - Appears after the main quiz (about interests) is completed
 * - Asks optional demographic/identity questions (like year in school, major, etc.)
 * - Users can skip this entirely and go straight to results
 * - If they choose to answer, shows questions one-by-one with dropdown menus
 * - Combines identity answers with quiz answers for better club matching
 * - Takes users to final results page when done
 * 
 * Why it's useful:
 * - Some clubs are specific to certain groups (like "Freshman Orientation Club")
 * - Identity info helps filter clubs that are relevant to the user
 * - Makes recommendations more personalized and accurate
 * 
 * Flow diagram:
 * 1. Show choice: "Answer identity questions?" or "Skip to results"
 * 2. If skip → calculate results → go to results page
 * 3. If yes → show questions one by one → calculate results → go to results page
 * 
 * @returns {JSX.Element} The rendered IdentityPage component (JSX is like HTML but in JavaScript)
 */
function IdentityPage() {
  // HOOKS: These are special React functions that let us use state and other features
  
  // useQuiz() connects us to our global quiz data storage
  // 'state' = current quiz data (like what answers they've given)
  // 'dispatch' = function to update/change the quiz data
  const { state, dispatch } = useQuiz();
  
  // useNavigate() gives us a function to move between pages programmatically
  const navigate = useNavigate();
  
  // LOCAL STATE: Data that only this component needs to track
  // selectedOption tracks what the user picked in the current dropdown
  // starts as null (nothing selected), updates when they choose something
  const [selectedOption, setSelectedOption] = useState(null);

  // ROUTE PROTECTION: Make sure user should be on this page
  // Only allow access if they completed the main survey
  if (!state.surveyComplete) {
    navigate('/'); // Send them back to home page if they shouldn't be here
    return null; // Don't render anything while navigating
  }

  // DATA PREPARATION: Get the current question to display
  // IDENTITY_QUESTIONS["Identity"] gives us an array of all identity questions
  const questionsForIdentity = IDENTITY_QUESTIONS["Identity"];
  // Get the specific question we're currently asking (based on currentQuestionIndex)
  const currentQuestion = questionsForIdentity[state.currentQuestionIndex];

  // EVENT HANDLERS: These are functions that run when user interacts with the page
  
  /**
   * Handles when user clicks "Skip to results"
   * Skips all identity questions and goes straight to calculating final results
   * 
   * What happens:
   * - Calls our calculation function with no identity answers (empty array)
   * - Calculation function figures out best clubs based on quiz answers only
   * - User gets taken to results page
   */
  const handleSkipIdentity = () => {
    finalizeScoresAndComputeClubs(); // Calculate results without identity info
  };

  /**
   * Handles when user clicks "Yes, let's improve my matches"
   * Starts the identity question flow
   * 
   * What happens:
   * - Updates global state to show identity questions interface
   * - Page will re-render and show the first identity question
   */
  const handleStartIdentity = () => {
    dispatch({ type: 'SET_SHOW_IDENTITY_QUESTIONS', payload: true });
  };

  /**
   * Handles when user clicks "Next Question" or "Get My Results"
   * Records their current answer and either shows next question or finishes
   * 
   * What happens:
   * 1. Gets what they selected in the dropdown (or 'other' if nothing selected)
   * 2. Saves that answer to our global state
   * 3. Checks if this was the last question
   *    - If last question: calculate final results and go to results page
   *    - If not last: move to next question and reset the dropdown
   */
  const handleNext = () => {
    // Get selected value 
    const value = selectedOption.value
    
    // Check if this was the last identity question
    if (state.currentQuestionIndex >= questionsForIdentity.length - 1) {
      // All identity questions answered - calculate final results
      // Create array of all their answers (including the one they just gave)
      const allResponses = [...state.userIdentityResponses, value];
      finalizeScoresAndComputeClubs(allResponses);
    } else {
      // Save this answer to our global quiz state
      dispatch({ type: 'ADD_IDENTITY_RESPONSE', payload: value });
      // Move to next identity question
      dispatch({ type: 'NEXT_QUESTION' });
      setSelectedOption(null); // Reset dropdown to show placeholder again
    }
  };

  /**
   * THE BIG CALCULATION FUNCTION: This is where the magic happens!
   * 
   * This function takes all the user's answers and figures out which clubs they'd like best.
   * It's like a matchmaking algorithm for clubs!
   * 
   * What it does step-by-step:
   * 1. Takes their quiz answers (tags) and identity answers
   * 2. Boosts scores for categories they said they were interested in
   * 3. Averages out their answers to get final preference scores
   * 4. Compares their preferences to every club's characteristics
   * 5. Finds the clubs most similar to what they want
   * 6. Filters clubs based on identity (if they answered those questions)
   * 7. Gives back the top 10 best matches
   * 8. Takes them to the results page to see their matches
   * 
   * @param {Array} identityResponses - Array of user's identity question answers (optional)
   */
  const finalizeScoresAndComputeClubs = (identityResponses = []) => {
    // STEP 1: Make a safe copy of user's quiz answers so we don't accidentally change the original
    // JSON.parse(JSON.stringify()) is a common trick to "deep copy" complex data
    let tempUserTags = JSON.parse(JSON.stringify(state.userTags));
    
    // STEP 2: Boost scores for categories they said they were interested in
    // If they selected "Sports" category, boost all sports-related tag scores
    tempUserTags = applyCategoryInterestScores(tempUserTags, state.selectedCategories);
    
    // STEP 3: Calculate final scores for each tag
    // Users might have answered multiple questions about the same topic
    // This averages those answers to get one final score per topic
    const finalScores = calcUserTagScores(tempUserTags);

    // STEP 4: Build the user vector (a fancy way to represent their preferences)
    // Think of this like a report card with 40 different subjects
    // Each number represents how much they like that type of activity (0-1 scale)
    const userVector = [];
    // NOTE: Tag IDs start at 1, not 0 (this matches our data structure in ALL_TAGS)
    // We loop from 1 to 40 because that's how the tags are numbered in our system
    for (let tagId = 1; tagId <= 40; tagId++) {
      // JavaScript automatically converts the integer 1 to the string "1" for object property access (automatic type coercion)
      userVector.push(finalScores[tagId]); // Use their score, or 0 if they never answered about this topic
    }

    // STEP 5: Find the best matching clubs!
    // This function compares the user's preferences to every club's characteristics
    // and finds the ones that are most similar (using math called "cosine similarity")
    const topTen = rankClubsBySimilarity(userVector, state.clubData, identityResponses);
    
    // STEP 6: Save the results and take them to see their matches
    dispatch({ type: 'SET_TOP_CLUBS', payload: topTen }); // Save the top 10 clubs
    dispatch({ type: 'COMPLETE_IDENTITY' }); // Mark identity phase as complete
    navigate('/results'); // Go to results page to show their matches
  };

  // CONDITIONAL RENDERING: Show different screens based on current state
  
  // SCREEN 1: Initial choice screen - "Do you want to answer identity questions?"
  // This shows when showIdentityQuestions is false (the default)
  if (!state.showIdentityQuestions) {
    return (
      <Layout>
        {/* Layout wraps our content with the header/navigation */}
        <div className="question-block">
          <h2 className="category-name">Optional Identity Questions</h2>
          <p className="subcategory-question">
            Would you like to answer some identity-based questions to improve your matchmaking results?
          </p>
          {/* Two buttons: Yes (start questions) or No (skip to results) */}
          <div className="answer-buttons">
            <button 
              className="answer-button yes-button"
              onClick={handleStartIdentity} // Run function to start identity questions
            >
              Yes, let's improve my matches
            </button>
            <button 
              className="answer-button no-button"
              onClick={handleSkipIdentity} // Run function to skip to results
            >
              Skip to results
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // SCREEN 2: Identity questions interface
  // This shows when user chose "Yes" to answering identity questions
  return (
    <Layout>
      {/* Layout wraps our content with the header/navigation */}
      
      {/* 
        PROGRESS BAR: Visual indicator of how far through questions they are
        Uses inline styles (style={{...}}) to dynamically set the width
        Math: (current question number / total questions) * 100 = percentage complete
      */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((state.currentQuestionIndex + 1) / questionsForIdentity.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="question-block">
        {/* 
          QUESTION HEADER: Shows title and current progress
          Example: "Identity Questions (2 of 5)"
        */}
        <h2 className="category-name">
          Identity Questions 
          <span className="question-counter">
            ({state.currentQuestionIndex + 1} of {questionsForIdentity.length})
          </span>
        </h2>
        
        {/* 
          CURRENT QUESTION: Display the actual question text
        */}
        <h3 className="subcategory-question">{currentQuestion}</h3>
        
        {/* 
          DROPDOWN MENU: Where user selects their answer
          This uses our custom Dropdown component with simple configuration
          All styling is handled by regular CSS classes in IdentityPage.css
        */}
        <div className="dropdown-container">
          <Dropdown
            options={IDENTITY_OPTIONS[currentQuestion]} // The available answers for this question
            onChange={(option) => setSelectedOption(option)} // Function to run when they pick something
            value={selectedOption} // What's currently selected (controlled component)
            placeholder="Select an option..." // Text shown when nothing is selected
            className="identity-dropdown" // CSS class for styling
            isSearchable // Allow typing to filter options
          />
        </div>
        
        {/* 
          NEXT/COMPLETE BUTTON: Advances to next question or finishes
          - Disabled if nothing is selected (can't proceed without an answer)
          - Text changes on last question: "Next Question" vs "Get My Results"
        */}
        <button 
          className="next-button"
          onClick={handleNext} // Function to run when clicked
          disabled={!selectedOption} // Can't click if nothing selected
        >
          {/* CONDITIONAL TEXT: Different button text based on whether this is the last question */}
          {state.currentQuestionIndex >= questionsForIdentity.length - 1 ? 'Get My Results' : 'Next Question'}
        </button>
      </div>
    </Layout>
  );
}

export default IdentityPage;
