// Import necessary React hooks and external dependencies
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Papa from 'papaparse'; // CSV parsing library - converts spreadsheet data to JavaScript
import { ALL_TAGS } from '../data/tags'; // Import tag definitions from another file
import '../types.js'

// Create React context - think of this as creating a "global storage box" for quiz data
// Any component in your app can access data from this box
const QuizContext = createContext();

// Define the initial state - this is what your quiz data looks like when the app first starts
const initialState = {
  clubData: [], // Will store club information loaded from CSV file
  
  // Create empty arrays for each numbered tag (1, 2, 3, etc.)
  // Object.keys(ALL_TAGS) gets numbered keys like ["1", "2", "3", ...]
  // .reduce() converts this array into an object like: { "1": [], "2": [], "3": [] }
  // Each empty array will later store the user's quiz answers for that specific tag ID
  userTags: Object.keys(ALL_TAGS).reduce((acc, tagId) => {
    acc[tagId] = []; // Create empty array for this tag ID
    return acc; // Return the building object
  }, {}), // Start with empty object {}
  
  selectedCategories: [], // Which categories user picked (max 3 allowed)
  userIdentityResponses: [], // Stores answers to identity questions
  currentCategoryIndex: 0, // Which category we're currently asking about (0 = first category)
  currentQuestionIndex: 0, // Which question within current category (0 = first question)
  topClubs: [], // Final club recommendations calculated from user answers
  quizStarted: false, // Has user started taking the quiz yet?
  surveyComplete: false, // Has user finished answering tag questions?
  identityCompleted: false, // Has user finished identity questions?
  showIdentityQuestions: false, // Should we show identity questions right now?
  loading: true, // Are we still downloading/processing data?
  error: null // If something goes wrong, store error message here
};

/**
 * REDUCER: The "command processor" for updating quiz data
 * Think of this like a vending machine - you put in a command (action) and get back new state
 * state = current quiz data, action = command object like { type: 'START_QUIZ' }
 * 
 * Handles logic for state updates
 * @param {QuizState} state current state of quiz
 * @param {QuizAction} action action object describing the update
 * 
 * @returns {QuizState} returns new QuizState post update
 */

function quizReducer(state, action) {
  switch (action.type) {
    // COMMAND: "Store the club data we just loaded from CSV"
    case 'SET_CLUB_DATA':
      return { 
        ...state, // Keep everything the same...
        clubData: action.payload, // ...except update clubData with new data
        loading: false // ...and we're done loading
      };
    
    // COMMAND: "Something went wrong loading data"
    case 'SET_ERROR':
      return { 
        ...state, // Keep everything the same...
        error: action.payload, // ...except store the error message
        loading: false // ...and stop showing loading
      };
    
    // COMMAND: "User clicked on a category - add it or remove it"
    case 'TOGGLE_CATEGORY':
      const category = action.payload; // Which category they clicked
      let newCategories;
      
      // If category is already selected, remove it
      if (state.selectedCategories.includes(category)) {
        newCategories = state.selectedCategories.filter(c => c !== category);
      // If under 3 categories, add this one
      } else if (state.selectedCategories.length < 3) {
        newCategories = [...state.selectedCategories, category];
      } else {
        // Already have 3 categories - don't change anything
        return state;
      }
      return { ...state, selectedCategories: newCategories };
    
    // COMMAND: "User clicked 'Start Quiz' button"
    case 'START_QUIZ':
      return { ...state, quizStarted: true };
    
    // COMMAND: "User answered a question - update their tag preferences"
    case 'UPDATE_USER_TAGS':
      console.log("CUR:", state.userTags)
      console.log("NEW:", action.payload)
      return { 
        ...state, 
        userTags: {
          ...state.userTags, // Keep existing tag data...
          ...action.payload  // ...and merge in new answers
        }
      };
    
    // COMMAND: "Move to next question in current category"
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1 // Add 1 to question number
      };
    
    // COMMAND: "Move to previous question in current category"
    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex - 1 // sub 1 to question number
      };
    
    // COMMAND: "Move to next category and start from first question"
    case 'NEXT_CATEGORY':
      return {
        ...state,
        currentCategoryIndex: state.currentCategoryIndex + 1, // Next category
        currentQuestionIndex: 0 // Reset to first question
      };
    
    // COMMAND: "User finished all tag questions"
    case 'COMPLETE_SURVEY':
      return { 
        ...state, 
        surveyComplete: true, 
        currentQuestionIndex: 0 // Reset question counter
      };
    
    // COMMAND: "Show or hide identity questions"
    case 'SET_SHOW_IDENTITY_QUESTIONS':
      return { ...state, showIdentityQuestions: action.payload }; // true or false
    
    // COMMAND: "User answered an identity question - add it to the list"
    case 'ADD_IDENTITY_RESPONSE':
      return {
        ...state,
        userIdentityResponses: [
          ...state.userIdentityResponses, // Keep existing answers...
          action.payload // ...and add new answer to end
        ]
      };
    
    // COMMAND: "User finished all identity questions"
    case 'COMPLETE_IDENTITY':
      return { ...state, identityCompleted: true };
    
    // COMMAND: "Here are the calculated club recommendations"
    case 'SET_TOP_CLUBS':
      return { ...state, topClubs: action.payload };
    
    // COMMAND: "Reset everything to start over (but keep club data)"
    case 'RESET_QUIZ':
      return { 
        ...initialState, // Reset to beginning...
        clubData: state.clubData, // ...but keep the club data we loaded
        loading: false // ...and don't show loading again
      };
    
    // If we get a command we don't recognize, don't change anything
    default:
      return state;
  }
}

/**
 * QUIZ PROVIDER: The "data manager" component that wraps your entire app
 * Initially fetches club data and provides the quiz with state and dispatch functions to all descendant components
 * @component
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children
 *  - React elements that will have access to the quiz context.
 * @returns {JSX.Element}
 *  A context provider wrapping 'props.children'
 */
export function QuizProvider({ children }) {
  // Set up the state management system
  // state = current quiz data, dispatch = function to send commands to reducer
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // useEffect runs when component first appears - perfect for loading data
  useEffect(() => {
    // Download the CSV file from the public folder
    fetch('./csv_folder/tagsAndIdentity.csv')
      .then(response => response.text()) // Convert downloaded file to text
      .then(text => {
        // Parse CSV text into JavaScript arrays using Papa Parse library
        // Since you confirmed all data is complete, use strict parsing settings
        const parsed = Papa.parse(text, {
          skipEmptyLines: true, // Skip completely empty lines
          header: false, // We handle the header manually
          dynamicTyping: false, // Keep everything as strings to avoid parsing issues
          fastMode: false, // Use slower but more reliable parsing
          delimiter: ',', // Explicitly set comma as delimiter
          quoteChar: '"', // Handle quoted fields properly
          escapeChar: '"', // Handle escaped quotes
          transformHeader: undefined, // Don't transform headers
          transform: undefined // Don't transform values during parsing
        });
        
        const rows = parsed.data;
        
        if (rows.length === 0) {
          throw new Error('CSV file is empty');
        }
        
        const header = rows[0]; // First row contains column names
        
        // Create a lookup table so we can find columns by name instead of number
        // Converts ["Club", "Tags", "Description"] into {"Club": 0, "Tags": 1, "Description": 2}
        const headerMapping = {};
        header.forEach((colName, index) => {
          headerMapping[colName] = index;
        });
        
        // Send the parsed data to our reducer to store in state
        // This triggers the 'SET_CLUB_DATA' case in our reducer above
        dispatch({ 
          type: 'SET_CLUB_DATA', 
          payload: { headerMapping, rows } 
        });
      })
      .catch(error => {
        // If anything goes wrong (file not found, parsing error, etc.)
        console.error('Error loading club data:', error);
        // Send error to reducer to store in state
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Failed to load club data' 
        });
      });
  }, []); // Empty array means "only run this once when component first loads"

  // Return the Provider component that shares our state with all child components
  // Think of this as setting up a Wi-Fi network that broadcasts quiz data
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children} {/* All the components inside this provider can access state & dispatch */}
    </QuizContext.Provider>
  );
}

/**
 * CUSTOM HOOK: A convenient way for components to access quiz data
 * Instead of components calling useContext(QuizContext) directly, they call useQuiz()
 * Checks if there is a Quiz Context and returns it
 * @returns {QuizContextValue} 
 * The quiz context object that contains current state and dispatch 
 */
export function useQuiz() {
  // Get the quiz data from the nearest QuizProvider up the component tree
  const context = useContext(QuizContext);
  
  // If this hook is called outside of a QuizProvider, throw helpful error
  // This prevents confusing bugs where components can't find quiz data
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  
  // Return { state, dispatch } so components can access data and send commands
  return context;
}

/* 
HOW TO USE THIS IN OTHER COMPONENTS:

1. Wrap your app with QuizProvider:
   <QuizProvider>
     <App />
   </QuizProvider>

2. In any component, access quiz data:
   const { state, dispatch } = useQuiz();
   
3. Read data:
   console.log(state.clubData);
   console.log(state.quizStarted);
   
4. Send commands:
   dispatch({ type: 'START_QUIZ' });
   dispatch({ type: 'NEXT_QUESTION' });
*/