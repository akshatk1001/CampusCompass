import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Papa from 'papaparse';
import { ALL_TAGS } from '../data/tags';

const QuizContext = createContext();

const initialState = {
  clubData: [],
  userTags: Object.keys(ALL_TAGS).reduce((acc, tagId) => {
    acc[tagId] = [];
    return acc;
  }, {}),
  selectedCategories: [],
  userIdentityResponses: [],
  currentCategoryIndex: 0,
  currentQuestionIndex: 0,
  topClubs: [],
  quizStarted: false,
  surveyComplete: false,
  identityCompleted: false,
  showIdentityQuestions: false,
  loading: true,
  error: null
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_CLUB_DATA':
      return { ...state, clubData: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'TOGGLE_CATEGORY':
      const category = action.payload;
      let newCategories;
      if (state.selectedCategories.includes(category)) {
        newCategories = state.selectedCategories.filter(c => c !== category);
      } else if (state.selectedCategories.length < 3) {
        newCategories = [...state.selectedCategories, category];
      } else {
        return state;
      }
      return { ...state, selectedCategories: newCategories };
    case 'START_QUIZ':
      return { ...state, quizStarted: true };
    case 'UPDATE_USER_TAGS':
      return { 
        ...state, 
        userTags: {
          ...state.userTags,
          ...action.payload
        }
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1
      };
    case 'NEXT_CATEGORY':
      return {
        ...state,
        currentCategoryIndex: state.currentCategoryIndex + 1,
        currentQuestionIndex: 0
      };
    case 'COMPLETE_SURVEY':
      return { ...state, surveyComplete: true, currentQuestionIndex: 0 };
    case 'SET_SHOW_IDENTITY_QUESTIONS':
      return { ...state, showIdentityQuestions: action.payload };
    case 'ADD_IDENTITY_RESPONSE':
      return {
        ...state,
        userIdentityResponses: [...state.userIdentityResponses, action.payload]
      };
    case 'COMPLETE_IDENTITY':
      return { ...state, identityCompleted: true };
    case 'SET_TOP_CLUBS':
      return { ...state, topClubs: action.payload };
    case 'RESET_QUIZ':
      return { ...initialState, clubData: state.clubData, loading: false };
    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  useEffect(() => {
    // Fetch club data from CSV on initial component mount
    fetch('./csv_folder/tagsAndIdentity.csv')
      .then(response => response.text())
      .then(text => {
        const parsed = Papa.parse(text);
        const rows = parsed.data;
        const header = rows[0];
        const headerMapping = {};
        header.forEach((colName, index) => {
          headerMapping[colName] = index;
        });
        dispatch({ 
          type: 'SET_CLUB_DATA', 
          payload: { headerMapping, rows } 
        });
      })
      .catch(error => {
        console.error('Error loading club data:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Failed to load club data' 
        });
      });
  }, []);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
