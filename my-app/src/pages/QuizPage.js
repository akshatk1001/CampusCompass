// React is the main library - we need this in every component file
import React from 'react';
// useNavigate lets us programmatically move to different pages (when our code decides to navigate)
import { useNavigate } from 'react-router-dom';
// Layout is our custom component that wraps the page with header/navigation
import Layout from '../components/Layout';
// useQuiz is our custom hook that gives us access to quiz data from anywhere in the app
import { useQuiz } from '../context/QuizContext';
// CATEGORY_QUESTIONS contains all the quiz questions organized by category
import { CATEGORY_QUESTIONS } from '../data/questions';
// Import the CSS styles for this specific page
import './QuizPage.css';

/**
 * QuizPage Component
 * 
 * This is the main quiz interface - where users actually answer questions!
 * Think of this like a questionnaire that goes through different topics one by one.
 * 
 * What this page does:
 * - Shows questions from the categories they selected on the home page
 * - Presents one question at a time with simple Yes/No buttons
 * - Tracks their progress with a visual progress bar
 * - Records their answers for later analysis
 * - Automatically moves through questions and categories
 * - Takes them to identity questions when all quiz questions are done
 * 
 * How the quiz flows:
 * 1. Start with first question from first selected category
 * 2. User answers Yes or No
 * 3. Move to next question in same category
 * 4. When category is done, move to next category
 * 5. When all categories done, go to identity page
 * 
 * Data it collects:
 * - For each question, saves a 1 (Yes) or 0 (No)
 * - Questions are linked to "tags" that represent different interests
 * - These numbers get analyzed later to find matching clubs
 * 
 * @returns {JSX.Element} The rendered QuizPage component (JSX is like HTML but in JavaScript)
 */
function QuizPage() {
  // HOOKS: These are special React functions that let us use state and other features
  
  // useQuiz() connects us to our global quiz data storage
  // 'state' = current quiz data (like which question we're on, user's answers)
  // 'dispatch' = function to update/change the quiz data

  // *********** IMPORTANT NOTE: whenever state changes, this component will re-render with the new data *********
  const { state, dispatch } = useQuiz();
  
  // useNavigate() gives us a function to move between pages programmatically
  // We use this for automatic redirects (when our code decides to navigate)
  const navigate = useNavigate();

  // ROUTE PROTECTION: Make sure user should be on this page
  // Only allow access if they properly started the quiz and selected categories
  if (!state.quizStarted || state.selectedCategories.length === 0) {
    navigate('/'); // Send them back to home page if they shouldn't be here
    return null; // Don't render anything while navigating
  }

  // DATA PREPARATION: Figure out which question to show right now
  
  // Get the name of the category we're currently asking about
  // Example: if they selected ["Sports", "Academic"] and we're on the first category,
  // this would be "Sports"
  const categoryName = state.selectedCategories[state.currentCategoryIndex];
  
  // Get all the questions for this specific category
  // CATEGORY_QUESTIONS looks like: { "Sports": [...questions], "Academic": [...questions] }
  const questionsForCategory = CATEGORY_QUESTIONS[categoryName];
  
  // Get the specific question we're showing right now
  // currentQuestion is an array like: ["Do you like team sports?", [1, 5, 12]]
  // [0] = the question text, [1] = array of tag IDs this question relates to
  const currentQuestion = questionsForCategory[state.currentQuestionIndex];

  // EVENT HANDLER: This function runs when user clicks Yes or No
  
  /**
   * Handles when user answers a question by clicking Yes or No
   * This is the core function that processes their responses and moves the quiz forward
   * 
   * What it does step-by-step:
   * 1. Converts their Yes/No answer into a number (1 or 0)
   * 2. Saves that number for all the "tags" this question relates to
   * 3. Figures out what to do next (next question, next category, or finish)
   * 4. Updates the quiz state to move forward
   * 
   * Why we use numbers instead of Yes/No:
   * - Later we'll average these numbers to get preference scores
   * - 1 means "I like this", 0 means "I don't like this"
   * - Numbers are easier for computers to calculate with
   * 
   * What are "tags"?
   * - Tags represent different interests/activities (like "teamwork", "outdoors", "leadership")
   * - Each question can relate to multiple tags
   * - Clubs also have scores for these same tags
   * - We match users to clubs by comparing tag scores
   * 
   * @param {Array} tagIds - Array of tag numbers this question relates to (like [1, 5, 12])
   * @param {boolean} answeredYes - true if they clicked Yes, false if they clicked No
   */
  const handleAnswer = (tagIds, answeredYes) => {
    // STEP 1: Convert Yes/No to number
    // answeredYes is true/false, we need 1/0 for calculations
    const numericAnswer = answeredYes ? 1 : 0;
    
    // STEP 2: Make a copy of existing user tags so we don't accidentally change the original
    // {...state.userTags} creates a "shallow copy" - like photocopying the data
    const updatedTags = { ...state.userTags };
    
    // STEP 3: Add this answer to all the tags this question relates to
    // Loop through each tag ID for this question
    tagIds.forEach(tid => {
      // For each tag, add the numeric answer to its array of responses
      // [...existingArray, newItem] adds newItem to the end of the array
      updatedTags[tid] = [...updatedTags[tid], numericAnswer];
    });

    // STEP 4: Save the updated tags to our global quiz state
    dispatch({ type: 'UPDATE_USER_TAGS', payload: updatedTags });

    // STEP 5: Figure out where to go next in the quiz
    // This is like a decision tree based on where we are in the quiz
    
    // Check if this was the last question in the current category
    if (state.currentQuestionIndex === questionsForCategory.length - 1) {
      // We finished this category! But are there more categories?
      if (state.currentCategoryIndex < state.selectedCategories.length - 1) {
        // Yes, there are more categories - move to the next one
        // This resets currentQuestionIndex to 0 and increments currentCategoryIndex
        dispatch({ type: 'NEXT_CATEGORY' });
      } else {
        // No more categories - we finished the entire quiz!
        // Mark survey as complete and go to identity questions
        dispatch({ type: 'COMPLETE_SURVEY' });
        navigate('/identity'); // Programmatic navigation to next phase
      }
    } else {
      // Still more questions in this category - move to next question
      // This increments currentQuestionIndex by 1
      dispatch({ type: 'NEXT_QUESTION' });
    }
  };

  // PROGRESS CALCULATION: Figure out how far through the quiz they are
  
  // Calculate overall progress percentage across all selected categories
  // This math shows them how much of the total quiz they've completed
  
  // How the math works:
  // - currentCategoryIndex = which category we're on (0, 1, 2...)
  // - currentQuestionIndex = which question in current category (0, 1, 2...)
  // - questionsForCategory.length = total questions per category (usually 7)
  // - selectedCategories.length = total categories they picked (1, 2, or 3)
  
  // Formula: (completed questions / total questions) * 100
  // Example: If they picked 2 categories with 7 questions each = 14 total questions
  //          If they're on category 1, question 3 = they've completed 10 questions
  //          Progress = (10 / 14) * 100 = 71%
  const progressPercentage = ((state.currentCategoryIndex * questionsForCategory.length + state.currentQuestionIndex + 1) / (state.selectedCategories.length * questionsForCategory.length)) * 100;

  // MAIN RENDER: This is what users see - the actual quiz interface
  return (
    <Layout>
      {/* Layout wraps our content with the header/navigation */}
      
      {/* 
        PROGRESS BAR: Visual indicator showing how far through the quiz they are
        Uses inline styles (style={{...}}) to dynamically set the width based on progress
        The progressPercentage variable controls how much of the bar is filled
      */}
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Main question display area - everything the user interacts with */}
      <div className="question-block">
        {/* 
          CATEGORY HEADER: Shows which category and question number they're on
          Example: "Sports (3 of 7)" means 3rd question out of 7 in the Sports category
        */}
        <h3 className="category-name">
          {categoryName} {/* Name of current category like "Sports" or "Academic" */}
          <span className="question-counter">
            ({state.currentQuestionIndex + 1} of {questionsForCategory.length})
          </span>
        </h3>
        
        {/* 
          THE ACTUAL QUESTION: This is what users read and respond to
          currentQuestion[0] gets the question text from the question array
          Example: "Do you enjoy working in teams?"
        */}
        <h2 className="subcategory-question">{currentQuestion[0]}</h2>
        
        {/* 
          ANSWER BUTTONS: The Yes and No buttons that users click
          Each button calls handleAnswer with different parameters when clicked
        */}
        <div className="answer-buttons">
          <button 
            className="answer-button yes-button"
            // When clicked: call handleAnswer with the question's tag IDs and true (for Yes)
            // currentQuestion[1] contains the array of tag IDs this question relates to
            onClick={() => handleAnswer(currentQuestion[1], true)}
          >
            Yes
          </button>
          <button 
            className="answer-button no-button"
            // When clicked: call handleAnswer with the question's tag IDs and false (for No)
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
