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
  1: ["Volunteering", 1],
  2: ["Networking", 2],
  3: ["Visual Arts", 3],
  4: ["Software Development", 14],
  5: ["Sustainability", 5],
  6: ["Leadership", 2],
  7: ["Tutoring", 7],
  8: ["Cultural Awareness", 8],
  9: ["Socializing", 9],
  10: ["Entrepreneurship", 10],
  11: ["Fitness", 16],
  12: ["Spirituality", 12],
  13: ["Competitive Gaming", 13],
  14: ["Engineering", 14],
  15: ["Agriculture", 15],
  16: ["Recreation", 16],
  17: ["Activism", 17],
  18: ["Historical Studies", 18],
  19: ["Research", 19],
  20: ["Performing Arts", 20],
  21: ["Human Rights", 21],
  22: ["Corporate Relations", 22],
  23: ["International Relations", 23],
  24: ["Inclusion", 24],
  25: ["STEM Education", 25],
  26: ["Creative Writing", 26],
  27: ["Artistic Design", 27],
  28: ["Financial Literacy", 28],
  29: ["Digital Media", 29],
  30: ["Career Development", 30],
  31: ["Legal Studies", 31],
  32: ["Campus Security", 32],
  33: ["Community Outreach", 33],
  34: ["Women's Empowerment", 34],
  35: ["Mental Wellness", 35],
  36: ["Animal Rights", 36],
  37: ["Coding", 37],
  38: ["Outdoor Adventures", 38],
  39: ["Family Support", 39],
  40: ["Culinary Arts", 40]
};

/**
 * TAG_LIST
 * A simple list of tag names corresponding to the keys in ALL_TAGS.
 */
const TAG_LIST = [
  "Volunteering",
  "Networking",
  "Visual Arts",
  "Software Development",
  "Sustainability",
  "Leadership",
  "Tutoring",
  "Cultural Awareness",
  "Socializing",
  "Entrepreneurship",
  "Fitness",
  "Spirituality",
  "Competitive Gaming",
  "Engineering",
  "Agriculture",
  "Recreation",
  "Activism",
  "Historical Studies",
  "Research",
  "Performing Arts",
  "Human Rights",
  "Corporate Relations",
  "International Relations",
  "Inclusion",
  "STEM Education",
  "Creative Writing",
  "Artistic Design",
  "Financial Literacy",
  "Digital Media",
  "Career Development",
  "Legal Studies",
  "Campus Security",
  "Community Outreach",
  "Women's Empowerment",
  "Mental Wellness",
  "Animal Rights",
  "Coding",
  "Outdoor Adventures",
  "Family Support",
  "Culinary Arts"
];

/**
 * ALL_IDENTITIES
 * A list of possible identity tags used for matching. These tags are weighted with a factor of 2.0.
 */
const ALL_IDENTITIES = [
  "White European Italian",
  "Black African American",
  "Native American",
  "Asian",
  "Hispanic",
  "Native Hawaiian or Other Pacific Islander",
  "woman women",
  "man men",
  "Greek",
  "lgbtq",
  "Christian",
  "Islam",
  "Jewish",
  "Hindu",
  "Buddhism",
  "Muslim",
  "Sikh",
  "Aerospace Engineering",
  "Agricultural Business",
  "Agricultural Communication",
  "Agricultural Science",
  "Agricultural Systems Management",
  "Animal Science",
  "Anthropology and Geography",
  "Architectural Engineering",
  "Architecture",
  "Art and Design",
  "Biochemistry",
  "Biological Sciences",
  "Biomedical Engineering",
  "BioResource and Agricultural Engineering",
  "Business Administration",
  "Chemistry",
  "Child Development",
  "City and Regional Planning",
  "Civil Engineering",
  "Communication Studies",
  "Comparative Ethnic Studies",
  "Computer Engineering",
  "Computer Science",
  "Construction Management",
  "Dairy Science",
  "Economics",
  "Electrical Engineering",
  "English",
  "Environmental Earth and Soil Sciences",
  "Environmental Engineering",
  "Environmental Management and Protection",
  "Food Science",
  "Forest and Fire Sciences",
  "General Engineering",
  "Graphic Communication",
  "History",
  "Industrial Engineering",
  "Industrial Technology and Packaging",
  "Interdisciplinary Studies",
  "Journalism",
  "Kinesiology",
  "Landscape Architecture",
  "Liberal Arts and Engineering Studies",
  "Liberal Studies",
  "Manufacturing Engineering",
  "Marine Sciences",
  "Materials Engineering",
  "Mathematics",
  "Mechanical Engineering",
  "Microbiology",
  "Music",
  "Nutrition",
  "Philosophy",
  "Physics",
  "Plant Sciences",
  "Political Science",
  "Public Health",
  "Psychology",
  "Recreation, Parks, and Tourism Administration",
  "Sociology",
  "Software Engineering",
  "Spanish",
  "Statistics",
  "Theatre Arts",
  "Wine and Viticulture"
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
    ["Are you passionate about volunteering to support local communities?", [1, 33, 17]],
    ["Do you enjoy advocating for social or environmental justice?", [17, 21, 5]],
    ["Would you like to work on projects promoting inclusion and diversity?", [24, 8, 34]],
    ["Are you interested in supporting animal rights initiatives?", [36, 1, 33]],
    ["Do you want to participate in activities that promote human rights?", [21, 1, 17]],
    ["Would you enjoy planning community events to foster social connections?", [33, 9, 8]],
    ["Are you open to working with diverse cultural groups to achieve shared goals?", [8, 23, 24]]
  ],
  "Arts & Culture": [
    ["Do you enjoy creating visual art, such as painting or sculpture?", [3, 27, 5]],
    ["Are you passionate about performing arts, like theater, dance, or music?", [20, 3, 26]],
    ["Do you like creative writing, such as poetry over storytelling?", [26, 3, 35]],
    ["Would you join a photography or digital design club?", [29, 3, 27]],
    ["Are you interested in textile arts or sustainable fashion design?", [27, 5, 3]],
    ["Do you prefer collaborative art projects over solo exhibitions?", [27, 3, 35]],
    ["Would you enjoy expressing your creativity in a non-competitive environment?", [3, 35, 27]]
  ],
  "Sports & Recreation": [
    ["Do you enjoy team-based sports like soccer, basketball, or volleyball?", [16, 11, 6]],
    ["Are individual activities such as yoga or pilates more appealing to you?", [16, 11, 35]],
    ["Do you prefer outdoor adventures like hiking or kayaking?", [16, 38, 11]],
    ["Would you participate in competitive events like races or tournaments?", [16, 13, 37]],
    ["Are you interested in water-based activities such as sailing or swimming?", [16, 11, 38]],
    ["Do you enjoy fitness classes or gym workouts?", [16, 11, 35]],
    ["Would you like to join a recreational club for fun rather than competition?", [16, 33, 9]]
  ],
  "Professional Development & Networking": [
    ["Do you want to join a club that focuses on career development or job skills?", [30, 2, 28]],
    ["Are you interested in learning about entrepreneurship or starting your own business?", [10, 2, 28]],
    ["Would you like to connect with professionals in your field of study?", [2, 22, 30]],
    ["Do you enjoy participating in leadership development programs?", [6, 2, 30]],
    ["Would you attend workshops on financial literacy or budgeting?", [28, 2, 30]],
    ["Are you interested in clubs that promote academic or professional success?", [7, 2, 30]],
    ["Do you enjoy networking events to expand your professional connections?", [2, 22, 30]]
  ],
  "Technology & Engineering": [
    ["Are you passionate about coding or software development?", [4, 37, 5]],
    ["Do you enjoy working on engineering projects or building things?", [14, 4, 5]],
    ["Would you like to join a robotics or AI-focused club?", [37, 14, 19]],
    ["Are you interested in promoting STEM education in your community?", [25, 4, 7]],
    ["Do you enjoy participating in hackathons or coding competitions?", [4, 37, 13]],
    ["Are you passionate about renewable energy or sustainable technology?", [5, 4, 14]],
    ["Would you like to work on interdisciplinary projects involving technology?", [4, 14, 19]]
  ],
  "Health & Wellness": [
    ["Are you interested in mental wellness and stress management?", [35, 11, 33]],
    ["Do you enjoy participating in fitness and wellness activities?", [11, 16, 35]],
    ["Would you like to join a yoga or meditation club?", [35, 11, 33]],
    ["Are you passionate about promoting healthy lifestyles?", [11, 35, 28]],
    ["Do you need support with maintaining a balanced life?", [35, 11, 28]],
    ["Would you attend workshops on nutrition and wellness?", [35, 28, 11]],
    ["Are you interested in peer support groups for mental health?", [35, 33, 28]]
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
    userVector.push(1.0);
  }

  // Special case: if "Greek" is one of the identities, adjust its score to 0.5
  if (userIdentityCols.includes("Greek")) {
    userVector[userVector.length - 1] = 0.5;
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