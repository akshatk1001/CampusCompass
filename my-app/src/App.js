import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Dropdown from './components/Dropdown';

import './App.css';

// -------------------- 1. DEFINE TAGS AND BROAD CATEGORIES --------------------
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

//No idea how this works but its just styling to make it look more visible, can change later
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
    maxHeight: '300px', // Allows more options to be visible (with scrolling if needed)
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


const IDENTITY_QUESTIONS = {
    "Identity" : [
    ["What gender do you identify the most with?"],
    ["What race do you identify the most with?"],
    ["What is your major?"],
    ["What religion do you identify the most with?"]
  ]
}

const IDENTITY_OPTIONS = {
  "What gender do you identify the most with?": [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'nonbinary', label: 'Non-binary' },
    { value: 'other', label: 'Other' }
  ],
  "What race do you identify the most with?": [
    { value: 'asian', label: 'Asian' },
    { value: 'black', label: 'Black' },
    { value: 'hispanic', label: 'Hispanic' },
    { value: 'white', label: 'White' },
    { value: 'other', label: 'Other' }
  ],
  "What is your major?": [
    { value: 'engineering', label: 'Engineering' },
    { value: 'business', label: 'Business' },
    { value: 'arts', label: 'Arts' },
    { value: 'science', label: 'Science' },
    { value: 'other', label: 'other' }
  ],
  "What religion do you identify the most with?": [
    { value: 'christianity', label: 'Christianity' },
    { value: 'islam', label: 'Islam' },
    { value: 'hinduism', label: 'Hinduism' },
    { value: 'buddhism', label: 'Buddhism' },
    { value: 'other', label: 'Other' }
  ]
};



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

// -------------------- 2. HELPER FUNCTIONS FROM PYTHON (JAVASCRIPT VERSIONS) --------------------

/* 
This function calculates the average score for each tag based on user responses. 
usertags is a dictionary where the key is the tag number and the value is a list of responses.
*/
function calcUserTagScores(userTags) {
  let rawAverages = {}; // Initialize an empty dictionary to store the raw averages
  for (const tagnumber in userTags) { // Iterate over each tag number (key) in the userTags dictionary
    const responses = userTags[tagnumber]; // Get the list of responses for the current tag
    if (!responses || responses.length === 0) { // If there are no responses for the current tag, set the raw average for the current tag to 0
      rawAverages[tagnumber] = 0;
    } else { // If there are responses for the current tag, calculate the raw average
      const sum = responses.reduce((acc, val) => acc + val, 0);  // Calculate the sum of the responses
      rawAverages[tagnumber] = sum / responses.length; // Calculate the raw average by dividing the sum of the responses by the number of responses
    }
  }

  let finalScores = {}; // Initialize an empty dictionary to store the final scores
  for (const tagnumber in rawAverages) { // Iterate over each tag number (key) in the userTags dictionary
    const avgTag = rawAverages[tagnumber]; // Get the raw average for the current tag

    let finalValue = avgTag; // Initialize the final value for the current tag to the raw average
    if (finalValue === 1 && userTags[tagnumber].length > 2) { // If the raw average is 1 and the user has responded to that tag a minimum of 2 times
      finalValue = 2; // Set the final value for the current tag to 2
    }
    finalScores[tagnumber] = finalValue; // Set the final score for the current tag to the final value
  }
  return finalScores; // Return the dictionary of final scores
}

function buildClubVectorFromRow(row) { // This function takes a row of data from the CSV file and returns a vector of tag scores for that club for cosine simiarity
  const vector = []; // Initialize an empty list to store the tag scores
  for (let tagId = 0; tagId <= 39; tagId++) { // Iterate over each tag number from 1 to 40
    vector.push(parseFloat(row[tagId])); // Add the tag score for the current tag to the vector
  }
  return vector; // Return the vector of tag scores
}

function cosineSimilarity(vecA, vecB) { // This function takes two vectors and returns the cosine similarity between them
  let dotProduct = 0; // Initialize the dot product to 0
  let normA = 0; // Initialize the norm of vector A to 0
  let normB = 0; // Initialize the norm of vector B to 0

  for (let i = 0; i < vecA.length; i++) { // Iterate over each element in the vectors
    dotProduct += vecA[i] * vecB[i]; // Calculate the dot product by multiplying the corresponding elements in the vectors
    normA += vecA[i] * vecA[i]; 
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function rankClubsBySimilarity(userVector, clubData) {
  let results = [];
  for (let i = 1; i < clubData.length; i++) {
    const row = clubData[i];
    if (row.length < 41) continue;
    const clubName = row[40];
    const clubLink = row[41];
    const clubVector = buildClubVectorFromRow(row);
    const similarity = cosineSimilarity(userVector, clubVector);
    results.push({ clubName, clubLink, similarity });
  }
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, 10);
}

// -------------------- 3. MAIN REACT COMPONENT --------------------
function App() {
  const [clubData, setClubData] = useState([]);
  const categoryKeys = Object.keys(CATEGORY_QUESTIONS);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userTags, setUserTags] = useState(() => {
    const initial = {};
    for (let tagId in ALL_TAGS) {
      initial[tagId] = [];
    }
    return initial;
  });
  // const [categoryInterest, setCategoryInterest] = useState({});
  const [surveyComplete, setSurveyComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [topClubs, setTopClubs] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [identityCompleted, setIdentityCompleted] = useState(false);

  // COMMENTING BECAUSE IT'S NOT USED
  // const [userResponsesIdentity, setUserResponsesIdentity] = useState({});
  
  const [selectedIdentityOption, setSelectedIdentityOption] = useState(null);
  const [showIdentityQuestions, setShowIdentityQuestions] = useState(false);


  // ------------------ ONLY CHANGE: Automatically load local CSV ------------------ //
  useEffect(() => {
    // On mount, fetch the CSV from the same folder and parse it with Papa
    fetch('./csv_folder/26MarchScored.csv')
      .then(response => response.text())
      .then(text => {
        const parsed = Papa.parse(text);
        console.log("CSV data loaded:", parsed);
        setClubData(parsed.data);
      });
  }, []);

  useEffect(() => {
    setSelectedIdentityOption(null);
  }, [currentQuestionIndex]);
  // ------------------------------------------------------------------------------ //

  const handleStartQuiz = () => {
    if (selectedCategories.length > 0) {
      console.log("Selected Categories:", selectedCategories);
      setQuizStarted(true);
    }
  };


const handleCategorySelection = (category) => {
  setSelectedCategories((prev) => {
    if (prev.includes(category)) {
      return prev.filter((c) => c !== category); // Remove if already selected
    } else if (prev.length < 3) {
      return [...prev, category]; // Add if less than 3 selected
    }
    return prev; // Prevent selecting more than 3
  });
};
  

// COMMENTING BECAUSE IT'S NOT USED
  // const handleCategoryInterestClick = () => {
  //     setCurrentQuestionIndex(0);
  // };

  const goToNextCategory = () => {
    if (currentCategoryIndex < selectedCategories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      finalizeScoresAndComputeClubs();
    }
  };


  const handleSubQuestionAnswer = (tagIds, answeredYes) => {
    const numericAnswer = answeredYes ? 1 : 0;
    setUserTags((prev) => {
      const updated = { ...prev };
      tagIds.forEach((tid) => {
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

  const applyCategoryInterestScores = (tempUserTags) => {
    // Iterate over all possible categories
    for (let categoryName of categoryKeys) {
      const catTagId = renameCategoryToNumber(categoryName);
      
      // If the category is in selectedCategories, push 1, otherwise push 0
      if (selectedCategories.includes(categoryName)) {
        tempUserTags[catTagId].push(1);
      } else {
        tempUserTags[catTagId].push(0);
      }
    }
    return tempUserTags;
  };

  const handleIdentityNext = () => {
    const value = selectedIdentityOption ? selectedIdentityOption.value : null;
    console.log("Recording identity answer:", value);
    // setUserResponsesIdentity((prevResponses) => ({
    //   ...prevResponses,
    //   [currentQuestionIndex]: value,
    // }));

    if (currentQuestionIndex >= questionsForIdentity.length - 1) {
      console.log("All identity questions answered");
      setIdentityCompleted(true);
    } else {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }
  };


  const handleIdentityQuestions = (answeredYes) => {
    const numericAnswer = answeredYes ? 1 : 0;
    if (numericAnswer){
      setShowIdentityQuestions(true);
      setCurrentQuestionIndex(0);
      //doIdentityQuestions();
    }else {
      setIdentityCompleted(true);
    }
  };

  
  

  const renameCategoryToNumber = (categoryName) => {
    if (categoryName === "Community Service & Advocacy") return 1;
    if (categoryName === "Creative Arts") return 3;
    if (categoryName === "Sports and Recreation") return 16;
    if (categoryName === "Environmental Sustainability") return 5;
    if (categoryName === "Professional Development & Networking") return 2;
    if (categoryName === "Technology and Engineering") return 14;
    if (categoryName === "Cultural Diversity and Social Connection") return 8;
    return 1;
  };

  const finalizeScoresAndComputeClubs = () => {
    let tempUserTags = JSON.parse(JSON.stringify(userTags));
    tempUserTags = applyCategoryInterestScores(tempUserTags);
    const finalScores = calcUserTagScores(tempUserTags);

    console.log(tempUserTags);
    console.log(finalScores);

    const userVector = [];
    // 1 and 40 and not 0 and 39?
    for (let tagId = 1; tagId <= 40; tagId++) {
      //console.log("tag: " + tagId + "," + finalScores[tagId]);
      userVector.push(finalScores[tagId] || 0);
    }
    const topTen = rankClubsBySimilarity(userVector, clubData);
    setTopClubs(topTen);
    setCurrentQuestionIndex(0);
    setSurveyComplete(true);
  };

  const questionsForIdentity = IDENTITY_QUESTIONS["Identity"];
  const currentIdentityQuestion = questionsForIdentity[currentQuestionIndex];


  if (surveyComplete && !identityCompleted){
    return (
      <div className="App">
        <header className="App-header">
          <div className="final-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
          <div className="question-block">
            <h2 className="category-name">Identity Questions</h2>
            {!showIdentityQuestions && (
              <div>
                <p className="subcategory-question">
                  Would you like to answer some identity based questions to improve matchmaking results
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
        </header>
      </div>
    );
  }


  if (surveyComplete && identityCompleted) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="final-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
          <h2 className="top-matches-title">Here are your top club matches!</h2>
          <button onClick={() => window.open("https://now.calpoly.edu/organizations", "_blank")}>Go See All Clubs</button>
          <button onClick={() => window.location.reload()}>Retake Quiz</button>
          <div className="club-list">
            {topClubs.map((club, index) => (
              <div key={index} className="club-item">
                <h3>{club.clubName}</h3>
                <button onClick={() => window.open(`${club.clubLink}`, "_blank")}>Click to View!</button>
                <p>Match: {(club.similarity * 100).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </header>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="logo-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
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

        </header>
      </div>
    );
  }

  const categoryName = selectedCategories[currentCategoryIndex];
  const questionsForCategory = CATEGORY_QUESTIONS[categoryName];
  const currentQuestion = questionsForCategory[currentQuestionIndex];
  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-title-container">
          <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
        </div>
        <div className="question-block">
          <h3 className="category-name">{categoryName}</h3>
          <h2 className="subcategory-question">{currentQuestion[0]}</h2>
          
          <button onClick={() => handleSubQuestionAnswer(currentQuestion[1], true)}>Yes</button>
          <button onClick={() => handleSubQuestionAnswer(currentQuestion[1], false)}>No</button>
        </div>
      </header>
    </div>
  );
}

export default App;
