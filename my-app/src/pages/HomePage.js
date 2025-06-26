// React is the main library - we need this in every component file
import React from 'react';
// Link lets us navigate between pages without refreshing the browser (like clicking a link)
import { Link } from 'react-router-dom';
// Layout is our custom component that wraps the page with header/navigation
import Layout from '../components/Layout';
// useQuiz is our custom hook that gives us access to quiz data from anywhere in the app
import { useQuiz } from '../context/QuizContext';
// CATEGORY_QUESTIONS contains all the quiz questions organized by category
import { CATEGORY_QUESTIONS } from '../data/questions';
// Import the CSS styles for this specific page
import './HomePage.css';

/**
 * HomePage Component
 * 
 * This is the main landing page where users start their club-finding journey.
 * Think of this like the front door of our app - users pick their interests here
 * before taking the quiz.
 * 
 * What this page does:
 * - Shows all available categories (like Sports, Academic, Arts, etc.)
 * - Lets users click to select up to 3 categories they're interested in
 * - Shows a summary of what they've selected
 * - Has a "Start Quiz" button that takes them to the actual quiz
 * - Handles loading states (when data is still downloading)
 * - Handles error states (when something goes wrong)
 * 
 * @returns {JSX.Element} The rendered HomePage component (JSX is like HTML but in JavaScript)
 */
function HomePage() {
  // HOOKS: These are special React functions that let us use state and other features
  
  // useQuiz() connects us to our global quiz data storage
  // 'state' = current quiz data (like what categories are selected)
  // 'dispatch' = function to update/change the quiz data
  const { state, dispatch } = useQuiz();
  
  // Object.keys() gets all the category names from our questions data
  // For example: ["Sports", "Academic", "Arts", "Technology"]
  const categoryKeys = Object.keys(CATEGORY_QUESTIONS);

  // EVENT HANDLERS: These are functions that run when user interacts with the page
  
  /**
   * Handles when user clicks on a category button
   * This function adds/removes categories from their selection
   * 
   * How it works:
   * - If category is already selected → remove it from selection
   * - If category is not selected → add it to selection (max 3 total)
   * 
   * @param {string} category - The name of the category they clicked (like "Sports")
   */
  const handleCategorySelection = (category) => {
    // dispatch sends a "message" to update our global state
    // 'TOGGLE_CATEGORY' = the type of update we want
    // category = the data we're sending along with the message
    dispatch({ type: 'TOGGLE_CATEGORY', payload: category });
  };

  /**
   * Handles when user clicks the "Start Quiz" button
   * This function makes sure they've selected categories before starting
   * 
   * What it does:
   * - If no categories selected → prevents going to quiz page
   * - If categories selected → marks quiz as started and allows navigation
   * 
   * @param {Event} e - The click event (automatically passed by React when used in onClick)
   */
  const handleStartQuiz = (e) => {
    // Check if user hasn't selected any categories yet
    if (state.selectedCategories.length === 0) {
      e.preventDefault(); // Stop the navigation from happening
      return; // Exit the function early - don't do anything else
    }
    // If we get here, they have selected categories, so start the quiz
    dispatch({ type: 'START_QUIZ' });
  };

  // CONDITIONAL RENDERING: Show different content based on the current state
  
  // Loading state: Show this while we're downloading club data from the server
  if (state.loading) {
    return (
      <Layout>
        <div className="loading-container">
          <h2>Loading club data...</h2>
        </div>
      </Layout>
    );
  }

  // Error state: Show this if something went wrong loading the data
  if (state.error) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Error: {state.error}</h2>
          {/* window.location.reload() refreshes the entire page to try again */}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    );
  }

  // MAIN RENDER: This is what users see when everything is working normally
  return (
    <Layout>
      {/* Layout wraps our content with the header/navigation */}
      
      {/* Main title that explains what to do */}
      <h2 className="survey-title">Select up to 3 categories you're interested in</h2>
      
      {/* Container for all the category buttons */}
      <div className="category-selection-container">
        <div className="category-selection">
          {/* 
            MAP FUNCTION: Loop through each category and create a button for it
            .map() takes each item in an array and transforms it into something else
            Here: each category name → a clickable button
          */}
          {categoryKeys.map((category) => (
            <button
              key={category} // React needs this to track each button uniquely
              // DYNAMIC CSS CLASSES: Change button appearance based on state
              // If category is selected, add "selected" class for different styling
              className={`category-button ${state.selectedCategories.includes(category) ? "selected" : ""}`}
              onClick={() => handleCategorySelection(category)} // Run our function when clicked
              // DISABLE LOGIC: Disable button if user already has 3 categories AND this isn't one of them
              disabled={state.selectedCategories.length >= 3 && !state.selectedCategories.includes(category)}
            >
              {category} {/* The text that appears on the button */}
            </button>
          ))}
        </div>
      </div>
      
      {/* 
        CONDITIONAL RENDERING: Only show this section if user has selected categories
        The && operator means: if left side is true, show the right side
      */}
      {state.selectedCategories.length > 0 && (
        <div className="selected-categories">
          <h3>Selected Categories:</h3>
          <ul>
            {/* Loop through selected categories and show each as a list item */}
            {state.selectedCategories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 
        NAVIGATION LINK: This button takes users to the quiz page
        Link is like <a> tag but for React Router - doesn't refresh the page
      */}
      <Link 
        to="/quiz" // Where to go when clicked
        // DYNAMIC CSS: Add "disabled" class if no categories selected (for gray styling)
        className={`start-quiz-button ${state.selectedCategories.length === 0 ? 'disabled' : ''}`}
        onClick={handleStartQuiz} // Run our function when clicked (to validate selection)
      >
        Start Quiz
      </Link>
    </Layout>
  );
}

export default HomePage;
