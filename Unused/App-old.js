import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Dropdown from './components/Dropdown';

import './App.css';

/* =============================================================================
   1. CONSTANTS & CONFIGURATIONS
   ============================================================================= */

/**
 * ALL_TAGS
 * A mapping of tag IDs to an array containing the tag name and a numeric weight.
 * These tags are used to score user interest in various club categories.
 */
const ALL_TAGS = {
  1: ["Leadership Development", 1],
  2: ["Professional Networking", 2],
  3: ["Academic Support", 3],
  4: ["Community Service", 4],
  5: ["Social Justice", 5],
  6: ["Environmental Sustainability", 6],
  7: ["Technical Skills", 7],
  8: ["Creative Expression", 8],
  9: ["Performance Arts", 9],
  10: ["Visual Arts", 10],
  11: ["Cultural Awareness", 11],
  12: ["Diversity & Inclusion", 12],
  13: ["Identity Exploration", 13],
  14: ["Peer Mentorship", 14],
  15: ["Career Preparation", 15],
  16: ["Entrepreneurship", 16],
  17: ["Research & Innovation", 17],
  18: ["Physical Fitness", 18],
  19: ["Competitive Activities", 19],
  20: ["Recreational Sports", 20],
  21: ["Outdoor Adventure", 21],
  22: ["Health & Wellness", 22],
  23: ["Mental Health Support", 23],
  24: ["Spiritual Growth", 24],
  25: ["Faith Communities", 25],
  26: ["Global Perspectives", 26],
  27: ["Political Engagement", 27],
  28: ["Media Production", 28],
  29: ["Technology & Computing", 29],
  30: ["Engineering Projects", 30],
  31: ["Scientific Exploration", 31],
  32: ["Agricultural Studies", 32],
  33: ["Business Skills", 33],
  34: ["Industry Connections", 34],
  35: ["Social Activities", 35],
  36: ["Campus Traditions", 36],
  37: ["Educational Outreach", 37],
  38: ["Skill Development", 38],
  39: ["Discussion Forums", 39],
  40: ["Collaborative Projects", 40]
};

/**
 * TAG_LIST
 * A simple list of tag names corresponding to the keys in ALL_TAGS.
 */
const TAG_LIST = [
  "Leadership Development",
  "Professional Networking",
  "Academic Support",
  "Community Service",
  "Social Justice",
  "Environmental Sustainability",
  "Technical Skills",
  "Creative Expression",
  "Performance Arts",
  "Visual Arts",
  "Cultural Awareness",
  "Diversity & Inclusion",
  "Identity Exploration",
  "Peer Mentorship",
  "Career Preparation",
  "Entrepreneurship",
  "Research & Innovation",
  "Physical Fitness",
  "Competitive Activities",
  "Recreational Sports",
  "Outdoor Adventure",
  "Health & Wellness",
  "Mental Health Support",
  "Spiritual Growth",
  "Faith Communities",
  "Global Perspectives",
  "Political Engagement",
  "Media Production",
  "Technology & Computing",
  "Engineering Projects",
  "Scientific Exploration",
  "Agricultural Studies",
  "Business Skills",
  "Industry Connections",
  "Social Activities",
  "Campus Traditions",
  "Educational Outreach",
  "Skill Development",
  "Discussion Forums",
  "Collaborative Projects"
];

/**
 * customStyles
 * Custom style definitions for the Dropdown component.
 * These styles manage the appearance for different states (focused, hovered, etc.).
 */
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#f0f8ff", // Light blue background
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

/**
 * IDENTITY_QUESTIONS & IDENTITY_OPTIONS
 * These objects define the set of identity-based questions and corresponding answer options.
 * They allow users to indicate their identity traits, which can then be used for matchmaking.
 */
const IDENTITY_QUESTIONS = {
  "Identity": [
    "What gender do you identify the most with?",
    "What race do you identify the most with?",
    "What is your major?",
    "What religion do you identify the most with?",
    "Are you interested in joining LGBTQ+ related communities?",
    "Are you interested in Greek Life?"
  ]
};

const IDENTITY_OPTIONS = {
  "What gender do you identify the most with?": [
    { value: 'man men', label: 'Male' },
    { value: 'woman women', label: 'Female' },
    { value: 'other', label: 'Non-binary' },
    { value: 'other', label: 'Other/Decline To Say' }
  ],
  "What race do you identify the most with?": [
    { value: 'White European Italian', label: 'White' },
    { value: 'Black African American', label: 'Black or African American' },
    { value: 'Native American', label: 'American Indian or Alaska Native' },
    { value: 'Asian', label: 'Asian' },
    { value: 'Hispanic', label: 'Hispanic' },
    { value: 'Native Hawaiian or Other Pacific Islander', label: 'Native Hawaiian or Other Pacific Islander' },
    { value: 'other', label: 'Other/Decline To Say' }
  ],
 "What is your major?": [
  { value: "Other/Decline To Say", label: "Other/Decline To Say" },
  { value: "Aerospace Engineering", label: "Aerospace Engineering" },
  { value: "Agricultural Business", label: "Agricultural Business" },
  { value: "Agricultural Communication", label: "Agricultural Communication" },
  { value: "Agricultural Science", label: "Agricultural Science" },
  { value: "Agricultural Systems Management", label: "Agricultural Systems Management" },
  { value: "Animal Science", label: "Animal Science" },
  { value: "Anthropology and Geography", label: "Anthropology and Geography" },
  { value: "Architectural Engineering", label: "Architectural Engineering" },
  { value: "Architecture", label: "Architecture" },
  { value: "Art and Design", label: "Art and Design" },
  { value: "Biochemistry", label: "Biochemistry" },
  { value: "Biological Sciences", label: "Biological Sciences" },
  { value: "Biomedical Engineering", label: "Biomedical Engineering" },
  { value: "BioResource and Agricultural Engineering", label: "BioResource and Agricultural Engineering" },
  { value: "Business Administration", label: "Business Administration" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Child Development", label: "Child Development" },
  { value: "City and Regional Planning", label: "City and Regional Planning" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Communication Studies", label: "Communication Studies" },
  { value: "Comparative Ethnic Studies", label: "Comparative Ethnic Studies" },
  { value: "Computer Engineering", label: "Computer Engineering" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Construction Management", label: "Construction Management" },
  { value: "Dairy Science", label: "Dairy Science" },
  { value: "Economics", label: "Economics" },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "English", label: "English" },
  { value: "Environmental Earth and Soil Sciences", label: "Environmental Earth and Soil Sciences" },
  { value: "Environmental Engineering", label: "Environmental Engineering" },
  { value: "Environmental Management and Protection", label: "Environmental Management and Protection" },
  { value: "Food Science", label: "Food Science" },
  { value: "Forest and Fire Sciences", label: "Forest and Fire Sciences" },
  { value: "General Engineering", label: "General Engineering" },
  { value: "Graphic Communication", label: "Graphic Communication" },
  { value: "History", label: "History" },
  { value: "Industrial Engineering", label: "Industrial Engineering" },
  { value: "Industrial Technology and Packaging", label: "Industrial Technology and Packaging" },
  { value: "Interdisciplinary Studies", label: "Interdisciplinary Studies" },
  { value: "Journalism", label: "Journalism" },
  { value: "Kinesiology", label: "Kinesiology" },
  { value: "Landscape Architecture", label: "Landscape Architecture" },
  { value: "Liberal Arts and Engineering Studies", label: "Liberal Arts and Engineering Studies" },
  { value: "Liberal Studies", label: "Liberal Studies" },
  { value: "Manufacturing Engineering", label: "Manufacturing Engineering" },
  { value: "Marine Sciences", label: "Marine Sciences" },
  { value: "Materials Engineering", label: "Materials Engineering" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Microbiology", label: "Microbiology" },
  { value: "Music", label: "Music" },
  { value: "Nutrition", label: "Nutrition" },
  { value: "Philosophy", label: "Philosophy" },
  { value: "Physics", label: "Physics" },
  { value: "Plant Sciences", label: "Plant Sciences" },
  { value: "Political Science", label: "Political Science" },
  { value: "Public Health", label: "Public Health" },
  { value: "Psychology", label: "Psychology" },
  { value: "Recreation, Parks, and Tourism Administration", label: "Recreation, Parks, and Tourism Administration" },
  { value: "Sociology", label: "Sociology" },
  { value: "Software Engineering", label: "Software Engineering" },
  { value: "Spanish", label: "Spanish" },
  { value: "Statistics", label: "Statistics" },
  { value: "Theatre Arts", label: "Theatre Arts" },
  { value: "Wine and Viticulture", label: "Wine and Viticulture" }
],

  "What religion do you identify the most with?": [
    { value: 'Christian', label: 'Christianity' },
    { value: 'Jewish Community and Judaism', label: 'Jewish' },
    { value: 'Islam', label: 'Islam' },
    { value: 'Hindu', label: 'Hinduism' },
    { value: 'Buddhism', label: 'Buddhism' },
    { value: 'other', label: 'Atheist' },
    { value: 'other', label: 'Agnostic' },
    { value: 'other', label: 'Other/Decline To Say' }
  ],
  "Are you interested in joining LGBTQ+ related communities?": [
    { value: 'lgbtq', label: 'Yes' },
    { value: 'other', label: 'Maybe' },
    { value: 'other', label: 'No' }
  ],
  "Are you interested in Greek Life?": [
    { value: 'Greek', label: 'Yes' },
    { value: 'other', label: 'Maybe' },
    { value: 'other', label: 'No' }
  ]
};

/**
 * CATEGORY_QUESTIONS
 * Defines the questions for each club category.
 * Each key represents a category with a list of questions and a set of associated tag IDs.
 */
const CATEGORY_QUESTIONS = {
  "Community Service & Advocacy": [
  ["Would you like to regularly volunteering for community service projects?", [1, 4, 35, 36]],
  ["Do you enjoy advocacy work that involves direct activism and public demonstrations?", [5, 12, 13, 27]],
  ["Are you willing to take leadership roles in organizing sustainability initiatives?", [1, 6, 21, 31]],
  ["Are you interested in providing one-on-one mentoring to underserved students?", [3, 14, 37, 38]],
  ["Do you like engaging in structured debates about controversial social issues rather than casual discussions?", [5, 11, 26, 39]],
  ["Are you comfortable with public speaking for activism campaigns?", [4, 5, 13, 28]],
  ["Do you enjoy administrative and planning aspects of community projects more than direct service work?", [1, 4, 40, 12]]
],
  "Arts & Culture": [
  ["Do you prefer creating visual art yourself rather than appreciating others' work?", [8, 10, 28, 38]],
  ["Would you be willing to perform on stage in front of an audience?", [8, 9, 35, 40]],
  ["Do you actively seek out cultural experiences from traditions different from your own?", [11, 12, 13, 26]],
  ["Are you drawn to artistic content that challenges societal norms rather than content focused on aesthetics?", [5, 8, 10, 13]],
  ["Would you spend time learning technical aspects of media production like sound engineering or video editing?", [7, 8, 28, 38]],
  ["Do you prefer independent creative projects rather than collaborative ones?", [8, 9, 35, 40]],
  ["Do you enjoy attending performing arts events?", [9, 10, 35, 36]]
],
  "Sports & Recreation": [
  ["Do you prefer team sports over individual sports?", [18, 20, 35, 40]],
  ["Do you enjoy outdoor activities like rock climbing or backpacking?", [18, 21, 22, 35]],
  ["Do you enjoy the competitive aspects of sports more than the recreational aspects?", [1, 18, 19, 20]],
  ["Are you interested in a sports club that practices multiple times a week?", [18, 20, 35, 38]],
  ["Do you prefer structured fitness routines over casual, spontaneous physical activities?", [18, 22, 23, 38]],
  ["Would you take on organizing responsibilities for sports events rather than just participating?", [1, 4, 20, 36]],
  ["Are you interested in less mainstream sports?", [11, 18, 20, 26]]
],
  "Professional Development & Networking": [
  ["Would you commit to taking on leadership positions with regular responsibilities?", [1, 2, 15, 38]],
  ["Do you prefer structured networking events over informal professional socializing?", [2, 15, 16, 34]],
  ["Are you interested in starting your own business or venture while in college?", [16, 33, 34, 38]],
  ["Would you prioritize projects that develop professional skills even if they don't align with your personal interests?", [7, 15, 38, 40]],
  ["Do you prefer being a mentor to others rather than receiving mentorship yourself?", [3, 14, 15, 37]],
  ["Are you willing to pursue career paths that prioritize social impact even if they offer lower financial compensation?", [4, 5, 15, 37]],
  ["Do you enjoy the planning and organizing aspects of professional events more than attending them?", [1, 2, 15, 33]]
],
  "Technology & Engineering": [
  ["Do you enjoy working on technical projects that require coding or programming skills?", [7, 29, 30, 38]],
  ["Would you rather develop new approaches than apply existing solutions to problems?", [6, 17, 30, 40]],
  ["Are you interested in joining a club that explores novel technologies?", [17, 29, 30, 31]],
  ["Are you interested in participating in competitive hackathons or engineering contests?", [7, 19, 29, 30]],
  ["Do you prefer working on projects in collaborative teams rather than independently?", [17, 29, 31, 40]],
  ["Are you interested in working on technological solutions focused on social good rather than those that advance business efficiency?", [4, 6, 29, 30]],
  ["Would you regularly attend industry conferences or technical talks even if held after hours or on weekends?", [2, 15, 29, 34]]
],
  "Health & Wellness": [
  ["Do you maintain a lifestyle centered around fitness and working out?", [18, 20, 22, 38]],
  ["Would you participate in regular group discussions about mental health challenges and coping strategies?", [22, 23, 39, 14]],
  ["Are you interested in incorporating mindfulness or meditation practices into your daily routine?", [22, 23, 24, 25]],
  ["Do you actively seek out information about holistic or alternative health approaches?", [11, 22, 26, 37]],
  ["Would you volunteer to lead or facilitate wellness programs for your peers?", [4, 14, 22, 23]],
  ["Do you prefer structured outdoor fitness activities over gym-based workouts?", [18, 21, 22, 35]],
  ["Are you willing to make significant lifestyle changes to reduce your environmental impact for health reasons?", [6, 22, 31, 39]]
],
  "Academic & Educational": [
  ["Do you regularly pursue academic interests outside of class and coursework?", [3, 17, 31, 39]],
  ["Would you commit to a research project that requires additional work outside of your classes and coursework?", [3, 17, 31, 39]],
  ["Do you prefer tutoring others in academic subjects rather than receiving help yourself?", [3, 14, 37, 38]],
  ["Are you willing to learn about diverse cultural perspectives even if they don't relate to your major?", [11, 13, 26, 37]],
  ["Would you be interested in participating in community-based learning projects?", [3, 4, 17, 37]],
  ["Do you actively seek out opportunities to work directly with faculty on research or creative projects?", [2, 3, 15, 34]],
  ["Would you regularly participate in debates and other knowledge competitions?", [3, 19, 37, 39]]
]
};

/* =============================================================================
   2. HELPER FUNCTIONS
   ============================================================================= */

/**
 * calcUserTagScores
 * -------------------
 * Computes the average score for each tag based on the user responses.
 *
 * @param {Object} userTags - Dictionary where keys are tag IDs and values are arrays of responses.
 * @returns {Object} finalScores - Averaged and adjusted score for each tag.
 *
 * This function calculates the raw average of responses for each tag. If the average is 1
 * and there are more than 2 responses, it upgrades that value to 2. This helps fine-tune
 * the tag weight based on the user's engagement.
 */
function calcUserTagScores(userTags) {
  let rawAverages = {}; // Store raw averages per tag
  for (const tagnumber in userTags) {
    const responses = userTags[tagnumber];
    if (!responses || responses.length === 0) {
      rawAverages[tagnumber] = 0;
    } else {
      const sum = responses.reduce((acc, val) => acc + val, 0);
      rawAverages[tagnumber] = sum / responses.length;
    }
  }

  let finalScores = {};
  for (const tagnumber in rawAverages) {
    const avgTag = rawAverages[tagnumber];
    let finalValue = avgTag;
    if (finalValue === 1 && userTags[tagnumber].length > 2) {
      finalValue = 2;
    }
    finalScores[tagnumber] = finalValue;
  }
  return finalScores;
}

/**
 * cosineSimilarity
 * -------------------
 * Computes the cosine similarity between two vectors.
 *
 * @param {Array} vecA - First vector (array of numbers).
 * @param {Array} vecB - Second vector (array of numbers).
 * @returns {Number} - The cosine similarity between the two vectors.
 *
 * Cosine similarity is used here to compare user interests (vector) with club feature vectors.
 */
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * keepColumnsAsArray
 * -------------------
 * Filters the input data (2D array) to keep only the desired columns.
 *
 * @param {Array} data - Array of rows (each row is an object or array).
 * @param {Array} columnsToKeep - List of column names to keep.
 * @param {Object} mapping - Mapping from column names to their indices.
 * @returns {Array} - New array with only the filtered columns.
 *
 * This helper transforms the club data to only include specific columns,
 * excluding any "other" fields.
 */
function keepColumnsAsArray(data, columnsToKeep, mapping) {
  return data.map(row =>
    columnsToKeep
      .filter(col => col !== "other")
      .map(col => row[mapping[col]])
  );
}

/**
 * rankClubsBySimilarity
 * -------------------
 * Ranks clubs based on the cosine similarity between the user's interest vector and each club's data.
 *
 * @param {Array} userVector - User's club interest vector.
 * @param {Object} clubDataObj - Object containing club data (header mapping and rows).
 * @param {Array} userIdentityCols - Identity responses used to adjust user scores.
 * @returns {Array} - List of top 10 clubs sorted by similarity score.
 *
 * This function adjusts the user vector with identity scores, computes cosine similarity
 * for each club (after parsing its club vector), sorts clubs by similarity, and returns the top matches.
 */
function rankClubsBySimilarity(userVector, clubDataObj, userIdentityCols) {
  const { headerMapping, rows } = clubDataObj;
  const allCols = ["Club Name", "links", ...TAG_LIST, ...userIdentityCols];
  const userFilteredData = keepColumnsAsArray(rows, allCols, headerMapping);
  

  // Count valid identity responses that are not null or 'other'
  let countIdentity = 0;
  if (userIdentityCols.length > 0) {
    countIdentity = userIdentityCols.filter(item => item !== null && item !== 'other').length;
  }

  // Append a score for each identity to the user vector
  for (let i = 0; i < countIdentity; i++) {
    userVector.push(2.0);
  }

  // Special case: if "Greek" is one of the identities, adjust its score to 0.5
  if (userIdentityCols.includes("Greek")) {
    userVector[userVector.length - 1] = 1.0;
  }
  
  console.log("User Vector:", userVector);
  console.log("User Identity Columns:", userIdentityCols);
  console.log("Columns to Keep:", allCols);

  let results = [];

  for (let i = 1; i < userFilteredData.length; i++) {
    const row = userFilteredData[i];
    const clubName = row[0];
    const clubLink = row[1];
    // Convert the remaining row values to a numerical vector
    const clubVector = row.slice(2).map(val => parseFloat(val));
    const categorySimilarity = cosineSimilarity(userVector, clubVector);
    results.push({ clubName, clubLink, similarity: categorySimilarity });
  }
  
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, 10);
}

/**
 * applyCategoryInterestScores
 * -------------------
 * Applies user responses for category interest to the temporary user tags.
 *
 * @param {Object} tempUserTags - The temporary user tag object where scores are stored.
 * @param {Array} selectedCategories - Categories that the user selected.
 * @returns {Object} - Updated tempUserTags with applied scores.
 *
 * For each category in CATEGORY_QUESTIONS, if the category was selected by the user,
 * a score of 1 is appended to that category's tag array; otherwise, a score of 0 is appended.
 */
function applyCategoryInterestScores(tempUserTags, selectedCategories) {
  const categoryKeys = Object.keys(CATEGORY_QUESTIONS);
  for (let categoryName of categoryKeys) {
    const catTagId = renameCategoryToNumber(categoryName);
    if (selectedCategories.includes(categoryName)) {
      tempUserTags[catTagId].push(1);
    } else {
      tempUserTags[catTagId].push(0);
    }
  }
  return tempUserTags;
}

/**
 * renameCategoryToNumber
 * -------------------
 * Maps a category name to a corresponding tag number.
 *
 * @param {String} categoryName - The name of the category.
 * @returns {Number} - The tag number corresponding to the category.
 *
 * This function provides a manual mapping for known categories. If the category does
 * not match any of the predefined ones, it defaults to returning 1.
 */
function renameCategoryToNumber(categoryName) {
  if (categoryName === "Community Service & Advocacy") return 1;
  if (categoryName === "Arts & Culture") return 3;
  if (categoryName === "Sports & Recreation") return 16;
  if (categoryName === "Professional Development & Networking") return 2;
  if (categoryName === "Technology & Engineering") return 14;
  if (categoryName === "Health & Wellness") return 11;
  return 1;
}

/* =============================================================================
   3. MAIN REACT COMPONENT
   ============================================================================= */

/**
 * App Component
 * -------------------
 * Main React component that handles:
 *  - Data fetching and parsing (club data and CSV)
 *  - Displaying category selection screen, category questions, identity questions,
 *    and finally club match results.
 *  - Managing user state and responses.
 *
 * The component is structured in several states:
 *  - Pre-quiz category selection.
 *  - Quiz (category questions) based on selected categories.
 *  - Optional identity questions to further improve matching.
 *  - Final display of top club matches based on similarity scores.
 */
function App() {
  const [clubData, setClubData] = useState([]);
  const categoryKeys = Object.keys(CATEGORY_QUESTIONS);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Initialize userTags with an empty array for each tag ID
  const [userTags, setUserTags] = useState(() => {
    const initial = {};
    for (let tagId in ALL_TAGS) {
      initial[tagId] = [];
    }
    return initial;
  });
  const [surveyComplete, setSurveyComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [topClubs, setTopClubs] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [identityCompleted, setIdentityCompleted] = useState(false);

  // Identity responses which are weighted at 2.0 for each matching tag.
  const [userResponsesIdentity, setUserResponsesIdentity] = useState([]);
  const [selectedIdentityOption, setSelectedIdentityOption] = useState(null);
  const [showIdentityQuestions, setShowIdentityQuestions] = useState(false);

  /**
   * useEffect: Fetch club data from CSV on initial component mount.
   * The CSV is parsed using PapaParse and stored along with a header mapping.
   */
  useEffect(() => {
    fetch('./csv_folder/tagsAndIdentity.csv')
      .then(response => response.text())
      .then(text => {
        const parsed = Papa.parse(text);
        const rows = parsed.data; // Array of rows
        const header = rows[0];
        const headerMapping = {};
        header.forEach((colName, index) => {
          headerMapping[colName] = index;
        });
        setClubData({ headerMapping, rows });
      });
  }, []);

  // Reset selected identity option on question index change
  useEffect(() => {
    setSelectedIdentityOption(null);
  }, [currentQuestionIndex]);
  

  /**
   * handleStartQuiz
   * -------------------
   * Called when the user starts the quiz after selecting categories.
   */
  const handleStartQuiz = () => {
    if (selectedCategories.length > 0) {
      console.log("Selected Categories:", selectedCategories);
      setQuizStarted(true);
    }
  };

  /**
   * handleCategorySelection
   * -------------------
   * Toggles the selection of a category.
   *
   * @param {String} category - The category being toggled.
   *
   * Users can select up to 3 categories.
   */
  const handleCategorySelection = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      }
      return prev;
    });
  };

  /**
   * goToNextCategory
   * -------------------
   * Proceeds to the next category's questions or moves to survey completion.
   */
  const goToNextCategory = () => {
    if (currentCategoryIndex < selectedCategories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // End of category questions. Will transition to identity questions.
      setCurrentQuestionIndex(0);
      setSurveyComplete(true);
    }
  };

  /**
   * handleSubQuestionAnswer
   * -------------------
   * Updates the userTags with the answer for a sub-question and advances to the next question.
   *
   * @param {Array} tagIds - List of tag IDs associated with the current question.
   * @param {Boolean} answeredYes - Indicates if the user answered "Yes".
   */
  const handleSubQuestionAnswer = (tagIds, answeredYes) => {
    const numericAnswer = answeredYes ? 1 : 0;
    setUserTags(prev => {
      const updated = { ...prev };
      tagIds.forEach(tid => {
        updated[tid] = [...updated[tid], numericAnswer];
      });
      return updated;
    });

    const questionsForCategory = CATEGORY_QUESTIONS[categoryKeys[currentCategoryIndex]];
    if (currentQuestionIndex === questionsForCategory.length - 1) {
      goToNextCategory();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  /**
   * handleIdentityNext
   * -------------------
   * Processes identity question responses and advances through identity questions.
   *
   * When all identity questions have been answered, it calls finalizeScoresAndComputeClubs().
   */
  function handleIdentityNext() {
    const value = selectedIdentityOption ? selectedIdentityOption.value : 'other';
    const updatedResponses = [...userResponsesIdentity, value];
    console.log("Recording identity answer:", value);
    
    if (currentQuestionIndex >= questionsForIdentity.length - 1) {
        console.log("All identity questions answered");
        // Pass all captured identity responses to finalize the matching
        finalizeScoresAndComputeClubs(updatedResponses);
        setIdentityCompleted(true);
    } else {
        setUserResponsesIdentity(updatedResponses);
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  }

  /**
   * handleIdentityQuestions
   * -------------------
   * Determines whether to show identity questions based on the user's choice.
   *
   * @param {Boolean} answeredYes - User's decision on answering identity based questions.
   *
   * If not answered, it proceeds directly to compute club matches.
   */
  const handleIdentityQuestions = (answeredYes) => {
    if (answeredYes) {
      setShowIdentityQuestions(true);
      setCurrentQuestionIndex(0);
    } else {
      finalizeScoresAndComputeClubs();
      setIdentityCompleted(true);
    }
  };

  /**
   * finalizeScoresAndComputeClubs
   * -------------------
   * Finalizes user scores from both category and identity responses, computes the user vector,
   * and ranks clubs based on the similarity.
   *
   * @param {Array} identityResponses - Array of identity responses from the user. Defaults to an empty array.
   *
   * This function applies category scores, builds the user interest vector, creates an identity vector,
   * and then uses cosine similarity to rank clubs. The top clubs are stored in state for display.
   */
  function finalizeScoresAndComputeClubs(identityResponses = []) {
  
    let tempUserTags = JSON.parse(JSON.stringify(userTags));
    tempUserTags = applyCategoryInterestScores(tempUserTags, selectedCategories);
    const finalScores = calcUserTagScores(tempUserTags);
  
    // Build the user category vector (40 tags)
    const userVector = [];
    for (let tagId = 1; tagId <= 40; tagId++) {
      userVector.push(finalScores[tagId] || 0);
    }
  
    const topTen = rankClubsBySimilarity(userVector, clubData, identityResponses);
    setTopClubs(topTen);
    setCurrentQuestionIndex(0);
    setSurveyComplete(true);
  }

  // Prepare identity questions and current question variables
  const questionsForIdentity = IDENTITY_QUESTIONS["Identity"];
  const currentIdentityQuestion = questionsForIdentity[currentQuestionIndex];

  /* =============================================================================
     4. RENDERING: CONDITIONAL COMPONENT RENDERING BASED ON STATE
     ============================================================================= */

  // If survey is complete but identity questions have not been fully completed.
  if (surveyComplete && !identityCompleted) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="final-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
        </header>
        <div className="question-block">
          <h2 className="category-name">Identity Questions</h2>
          {!showIdentityQuestions && (
            <div>
              <p className="subcategory-question">
                Would you like to answer some identity based questions to improve matchmaking results?
              </p>
              <button onClick={() => handleIdentityQuestions(true)}>Yes</button>
              <button onClick={() => handleIdentityQuestions(false)}>No, take me to results</button>
            </div>
          )}
          {showIdentityQuestions && (
            <div>
              <h3 className="subcategory-question">{currentIdentityQuestion}</h3>
              <Dropdown
                options={IDENTITY_OPTIONS[currentIdentityQuestion]}
                onChange={(option) => setSelectedIdentityOption(option)}
                value={selectedIdentityOption}
                placeholder="Select an option..."
                styles={customStyles}
                isSearchable
              />
              <button onClick={handleIdentityNext}>Next Question</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If both survey and identity questions are complete, display club matches.
  if (surveyComplete && identityCompleted) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="final-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
        </header>
        <h2 className="top-matches-title">Here are your top club matches!</h2>
        <button onClick={() => window.open("https://now.calpoly.edu/organizations", "_blank")}>Go See All Clubs</button>
        <button onClick={() => window.location.reload()}>Retake Quiz</button>
        <div className="club-list">
          {topClubs.map((club, index) => (
            <div key={index} className="club-item">
              <h3>{club.clubName}</h3>
              <button onClick={() => window.open(`${club.clubLink}`, "_blank")}>Click to View</button>
              <p>Match: {(club.similarity * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If the quiz hasn't started, show the category selection screen.
  if (!quizStarted) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="logo-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
        </header>
        <h2 className="survey-title">Select up to 3 categories</h2>
        <div className="category-selection-container">
          <div className="category-selection">
            {categoryKeys.map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategories.includes(category) ? "selected" : ""}`}
                onClick={() => handleCategorySelection(category)}
                disabled={selectedCategories.length >= 3 && !selectedCategories.includes(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <button 
          className="start-quiz-button"
          onClick={handleStartQuiz}
          disabled={selectedCategories.length === 0}>
          Start Quiz
        </button>
      </div>
    );
  }

  // Otherwise, display the category questions.
  const categoryName = selectedCategories[currentCategoryIndex];
  const questionsForCategory = CATEGORY_QUESTIONS[categoryName];
  const currentQuestion = questionsForCategory[currentQuestionIndex];
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-title-container">
          <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
        </div>
      </header>
      <div className="question-block">
        <h3 className="category-name">{categoryName}</h3>
        <h2 className="subcategory-question">{currentQuestion[0]}</h2>
        <button onClick={() => handleSubQuestionAnswer(currentQuestion[1], true)}>Yes</button>
        <button onClick={() => handleSubQuestionAnswer(currentQuestion[1], false)}>No</button>
      </div>
    </div>
  );
}

export default App;
