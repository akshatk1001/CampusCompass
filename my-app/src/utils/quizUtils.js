// Import tag definitions and questions from our data files
// TAG_LIST contains all the different interest categories we track
import { TAG_LIST } from '../data/tags';
// CATEGORY_QUESTIONS contains all the quiz questions organized by category
import { CATEGORY_QUESTIONS } from '../data/questions';
import { ONLY_IDENTITIES } from '../data/identity';

/**
 * calcUserTagScores - THE SCORE CALCULATOR
 * ==========================================
 * 
 * This function takes all the user's quiz answers and calculates their final preference scores.
 * 
 * How it works:
 * 1. For each interest topic (tag), look at all the user's answers about that topic
 * 2. Calculate the average of those answers (1 = Yes, 0 = No, so 0.5 = mixed feelings)
 * 3. Apply special boost: if someone consistently says "Yes" to something, boost their score
 * 
 * Why we do this:
 * - Users answer multiple questions about the same topic (like "teamwork")
 * - We need one final score per topic to compare with clubs
 * - The boost rewards people who are REALLY interested in something
 * 
 * Example:
 * - User answers 3 questions about "leadership": Yes, Yes, No
 * - Average = (1 + 1 + 0) / 3 = 0.67
 * - Since they answered more than 2 questions and got perfect average (would be 1.0), they get boosted to 2.0
 *
 * @param {Object} userTags - Dictionary where keys are tag IDs and values are arrays of responses
 *                           Example: { "1": [1, 0, 1], "2": [0, 1], "3": [1, 1, 1] }
 * @returns {Object} finalScores - Final preference score for each tag (0-2 scale)
 *                                Example: { "1": 0.67, "2": 0.5, "3": 2.0 }
 */
export function calcUserTagScores(userTags) {
  // STEP 1: Calculate raw averages for each tag
  // This is like calculating your test average for each subject
  
  let rawAverages = {};
  
  // Loop through each tag (interest topic)
  for (const tagnumber in userTags) {
    const responses = userTags[tagnumber]; // Get all their answers for this topic
    
    // Check if they never answered questions about this topic
    if (!responses || responses.length === 0) {
      rawAverages[tagnumber] = 0; // Default to 0 (no interest)
    } else {
      // Calculate average: add up all answers, divide by count
      // Example: [1, 0, 1] → (1+0+1)/3 = 0.67
      const sum = responses.reduce((acc, val) => acc + val, 0);
      rawAverages[tagnumber] = sum / responses.length;
    }
  }

  // STEP 2: Apply special boosting rule
  // If someone answered many questions about a topic AND got a perfect score, boost them!
  
  let finalScores = {};
  
  // Loop through each calculated average
  for (const tagnumber in rawAverages) {
    const avgTag = rawAverages[tagnumber];
    let finalValue = avgTag; // Start with the average
    
    // BOOST RULE: Perfect score + many questions = extra boost
    // This rewards people who consistently love something
    if (finalValue === 1 && userTags[tagnumber].length > 2) {
      finalValue = 2; // Double boost for strong consistent interest!
    }
    
    finalScores[tagnumber] = finalValue;
  }
  
  return finalScores;
}

/**
 * cosineSimilarity - THE SIMILARITY CALCULATOR
 * ============================================
 * 
 * This is the core math that determines how similar a user is to a club!
 * It's like asking: "How much do these two things have in common?"
 * 
 * What is cosine similarity?
 * - Imagine two arrows pointing in space
 * - If they point in the same direction = very similar (score close to 1)
 * - If they point in opposite directions = very different (score close to 0)
 * - If they're perpendicular = neutral (score around 0.5)
 * 
 * In our case:
 * - User vector = [0.8, 0.2, 0.9, ...] (their interest levels)
 * - Club vector = [0.7, 0.1, 0.8, ...] (club's characteristics)
 * - Result = 0.95 means 95% similar!
 * 
 * The math:
 * similarity = (A·B) / (|A| × |B|)
 * where A·B is dot product, |A| and |B| are magnitudes
 * 
 * @param {Array} vecA - First vector (usually user preferences)
 * @param {Array} vecB - Second vector (usually club characteristics)  
 * @returns {number} - Similarity score between 0 and 1 (higher = more similar)
 */
export function cosineSimilarity(vecA, vecB) {
  // Validate input vectors
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    console.error('Invalid vectors for cosine similarity calculation');
    return 0;
  }
  
  // Initialize our three key calculations
  let dotProduct = 0; // How much vectors "agree" with each other
  let normA = 0;      // "Length" of vector A
  let normB = 0;      // "Length" of vector B
  
  // Calculate all three values in one loop (efficient!)
  for (let i = 0; i < vecA.length; i++) {
    // Dot product: multiply corresponding elements and sum them
    // Example: [0.8, 0.2] · [0.7, 0.1] = (0.8×0.7) + (0.2×0.1) = 0.56 + 0.02 = 0.58
    dotProduct += vecA[i] * vecB[i];
    
    // Calculate magnitude components (we'll square root these later)
    // This measures how "long" each vector is
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  // Prevent division by zero
  const magnitudeA = Math.sqrt(normA);
  const magnitudeB = Math.sqrt(normB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    console.warn('Zero magnitude vector detected in cosine similarity');
    return 0; // Return 0 similarity for zero vectors
  }
  
  // Final calculation: normalize the dot product by vector lengths
  // This ensures the result is always between 0 and 1
  const similarity = dotProduct / (magnitudeA * magnitudeB);
  
  // Ensure result is valid
  if (isNaN(similarity)) {
    console.error('NaN result in cosine similarity calculation');
    return 0;
  }
  
  return similarity;
}

/**
 * getRelevantIdentities - THE IDENTITY FILTER
 * ==========================
 * This function filters out the user's identity responses to find relevant identities.
 * It removes any 'other' or null responses and returns a list of identities that can be used for
 * matchmaking.
 * It also expands the identities to include all relevant traits from the ONLY_IDENTITIES array.
 * @param {Array} selectedIdentities - Array of user's identity responses (e.g., ["man men", "Theatre Arts", "other"])
 * @returns {Array} - Array of all other ident
 */

export function getRelevantIdentities(selectedIdentities) {
  // Filter out any 'other' or null responses
  const startList = selectedIdentities.filter(identity => identity !== 'other' && identity !== null);
  
  // get all other valid identities in that same question
  const relevantIdentities = startList.flatMap(identity => {
    // find the subwarray in ONLY_IDENTITIES that contains this identity
    const group = ONLY_IDENTITIES.find(arr => arr.includes(identity));
    // if found, return all identities in that group; otherwise, just the identity itself
    return group ? group : [identity];
  });

  return relevantIdentities;

}

/**
 * keepColumnsAsArray - THE DATA FILTER
 * ====================================
 * 
 * This function is like using Excel's "filter columns" feature.
 * We have a huge spreadsheet of club data, but we only want certain columns.
 * 
 * What it does:
 * - Takes a 2D array (like a spreadsheet)
 * - Keeps only the columns we care about
 * - Returns a smaller, focused dataset
 * 
 * Why we need this:
 * - The CSV has tons of columns (100+)
 * - We only need specific ones for our calculations
 * - This makes processing faster and cleaner
 * 
 * Example:
 * Input:  [["Club", "Link", "Sport", "Academic", "Other"], 
 *          ["Chess", "url1", 0.1, 0.9, 0.2]]
 * Keep:   ["Club", "Academic"] 
 * Output: [["Chess"], [0.9]]
 * 
 * @param {Array} data - 2D array representing spreadsheet data
 * @param {Array} columnsToKeep - Array of column names we want to keep
 * @param {Object} mapping - Maps column names to their index positions
 * @returns {Array} - Filtered 2D array with only the desired columns
 */
export function keepColumnsAsArray(data, columnsToKeep, mapping) {
  // STEP 1: Validate which columns actually exist in the CSV
  // Filter out any columns that don't have a mapping (missing from CSV)
  const validColumns = columnsToKeep
    .filter(col => {
      // ignore column if it is 'other'
      if (col === 'other') {
        console.log(`Skipping 'other' column as it is not needed.`);
        return false; // Skip this column
      }
      // Check if this column exists in our CSV
      const columnExists = mapping.hasOwnProperty(col);
      
      // Log warning for missing columns (helps with debugging)
      if (!columnExists) {
        console.warn(`Column "${col}" not found in CSV data. Skipping...`);
      }
      
      return columnExists;
    });
  
  // STEP 2: Process each row of the spreadsheet using only valid columns
  return data.map((row, rowIndex) =>
    validColumns.map(col => {
      const columnIndex = mapping[col]; // the column index in the CSV
      const value = row[columnIndex]; 
      
      // Convert to number if it's a string representation of a number
      if (typeof value === 'string') {
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? value : numericValue;
      }
      
      // Return the value as-is, or 0 if somehow undefined (should not happen with complete data)
      return value !== undefined ? value : 0;
    })
  );
  
  // What this does step-by-step:
  // 1. Validate that requested columns actually exist in the CSV
  // 2. For each row in the data
  // 3. For each valid column we want to keep
  // 4. Look up the column's position using the mapping
  // 5. Extract that data from the row (with safety checks)
  // 6. Return the filtered row with only valid data
}

/**
 * rankClubsBySimilarity - The main club matching algorithm
 * 
 * This is the heart of the entire application! 🎯
 * It takes a user's preferences and finds the clubs that match them best.
 * Think of it like a dating app, but for clubs!
 * 
 * How the magic happens:
 * 1. Take user's quiz results (their interest vector)
 * 2. Add their identity preferences to the vector
 * 3. Compare their vector to every club's vector
 * 4. Rank clubs by similarity score
 * 5. Return the top 10 matches
 * 
 * The vectors explained:
 * - User vector: [0.8, 0.2, 0.9, ...] = "I love leadership, don't like sports, love creativity..."
 * - Club vector: [0.7, 0.1, 0.8, ...] = "This club is leadership-focused, not sports-related, very creative..."
 * - Similarity: How close these vectors are = how good the match is!
 * 
 * @param {Array} userVector - User's preference scores for the 40 interest tags (0-1 scale)
 * @param {Object} clubDataObj - Object containing club data and mappings
 * @param {Array} userIdentityCols - User's identity responses (like major, year, etc.)
 * @returns {Array} - Top 10 club matches with similarity scores
 */
export function rankClubsBySimilarity(userVector, clubDataObj, userIdentityCols) {
  // STEP 1: Process identity responses  
  // Get the filtered valid identity responses (excluding null and 'other')
  // We ignore null and 'other' responses since they don't provide filtering value
  const identitiesToInclude = getRelevantIdentities(userIdentityCols);

  // STEP 2: Set up our data processing
  const { headerMapping, rows } = clubDataObj;
  // Define which columns we need from the club data
  // "Club Name" and "links" for display, TAG_LIST for interests, identitiesToInclude for filtering
  const allCols = ["Club Name", "links", ...TAG_LIST, ...identitiesToInclude];
  
  // Filter the club data to only include the columns we need
  const userFilteredData = keepColumnsAsArray(rows, allCols, headerMapping);
  

  // STEP 3: Enhance the user vector with identity scores
  
  // Add a high score (2.0) for each identity characteristic the user selected, and 0 for the ones they didn't
  // This boosts similarity for clubs that match the user's identity
  for (let i = 0; i < identitiesToInclude.length; i++) {
    if (userIdentityCols.includes(identitiesToInclude[i])) {
      userVector.push(2.0);
    } else {
      userVector.push(0);
    }
  }

  // Special case: Greek life gets a lower boost (1.0 instead of 2.0)
  // This is because we noticed when this is set to 2.0, results are heavily skewed
  if (userIdentityCols.includes("Greek")) {
    // Find the correct index of "Greek" in the valid responses
    const greekIndex = identitiesToInclude.indexOf("Greek");
    if (greekIndex !== -1) {
      // Greek is at TAG_LIST.length + greekIndex in the userVector
      const greekVectorIndex = TAG_LIST.length + greekIndex;
      userVector[greekVectorIndex] = 1.0;
    }
  }
  
  // Debug logging to help understand what's happening
  console.log("User Vector:", userVector);
  console.log("User Identity Columns:", userIdentityCols);
  console.log("Columns to Keep:", allCols);

  // STEP 4: Calculate similarity for each club
  
  let results = [];

  // Loop through each club (skip header row, so start at index 1)
  for (let i = 1; i < userFilteredData.length; i++) {
    const row = userFilteredData[i];
    
    // Skip empty or invalid rows
    if (!row || row.length < 3) {
      console.warn(`Skipping invalid row at index ${i}`);
      continue;
    }
    
    // Extract club information
    const clubName = row[0];  // Club name for display
    const clubLink = row[1];  // Link to club's page
    
    // Skip rows with missing essential data
    if (!clubName || clubName.trim() === '') {
      console.warn(`Skipping row with missing club name at index ${i}`);
      continue;
    }
    
    // Extract club's characteristic vector (everything after name and link)
    // Convert strings to numbers for mathematical comparison
    const clubVector = row.slice(2).map(val => {
      const num = parseFloat(val);
      if (isNaN(num)) {
        console.warn(`Invalid number found in club vector for "${clubName}" at index ${i}: ${val}`);
        return 0;
      }
      return num; // Default to 0 for invalid numbers
    });
    
    // Ensure vectors have the same length
    if (clubVector.length !== userVector.length) {
      console.warn(`Vector length mismatch for club "${clubName}": expected ${userVector.length}, got ${clubVector.length}`);
      continue;
    }
    
    // THE MAGIC MOMENT: Calculate how similar this club is to the user
    const categorySimilarity = cosineSimilarity(userVector, clubVector);
    
    // Skip clubs with invalid similarity scores
    if (isNaN(categorySimilarity) || categorySimilarity < 0) {
      console.warn(`Invalid similarity score for club "${clubName}": ${categorySimilarity}`);
      continue;
    }
    
    // Store the result with all the info we need
    results.push({ clubName, clubLink, similarity: categorySimilarity });
  }
  
  // STEP 5: Sort and return best matches
  
  // Ensure we have results
  if (results.length === 0) {
    console.error('No valid club matches found!');
    return [];
  }
  
  // Sort by similarity score (highest first)
  results.sort((a, b) => b.similarity - a.similarity);
  
  // Return only the top 10 matches
  return results.slice(0, 10);
}

/**
 * applyCategoryInterestScores - THE CATEGORY BOOSTER
 * ==================================================
 * 
 * This function gives extra credit to users for the categories they selected!
 * Think of it like getting bonus points on a test for your favorite subjects.
 * 
 * How it works:
 * 1. Look at which categories the user picked on the home page (like "Sports", "Academic")
 * 2. For each category, add a bonus score to their preferences
 * 3. Selected categories get +1 (boost), unselected get 0 (neutral)
 * 
 * Why this matters:
 * - User explicitly said "I'm interested in Sports" by selecting that category
 * - Even if their quiz answers were mixed, we should boost sports-related matches
 * - This ensures their conscious choices influence the results
 * 
 * Example:
 * - User selected: ["Sports", "Academic"] 
 * - Sports gets +1 boost, Academic gets +1 boost
 * - Arts (not selected) gets 0 boost
 * - Result: User will see more sports and academic clubs in their matches
 * 
 * @param {Object} tempUserTags - Copy of user's quiz responses
 * @param {Array} selectedCategories - Categories user chose on home page
 * @returns {Object} - Updated user tags with category bonuses added
 */
export function applyCategoryInterestScores(tempUserTags, selectedCategories) {
  // Get all available category names from our questions data
  const categoryKeys = Object.keys(CATEGORY_QUESTIONS);
  
  // Loop through each category and apply appropriate score
  for (let categoryName of categoryKeys) {
    // Convert category name to its corresponding tag number
    // Example: "Sports & Recreation" → tag number 18
    const catTagId = renameCategoryToNumber(categoryName);
    
    // Check if user selected this category
    if (selectedCategories.includes(categoryName)) {
      // They selected it! Give them a bonus point (1)
      tempUserTags[catTagId].push(1);
    } 
    // If they didn't select it, don't do anything special
  }
  
  return tempUserTags;
}

/**
 * renameCategoryToNumber
 * -------------------
 * Maps a category name to a corresponding tag number.
 */
export function renameCategoryToNumber(categoryName) {
  if (categoryName === "Community Service & Advocacy") return 4; // Community Service is tag 4
  if (categoryName === "Arts & Culture") return 8; // Creative Expression is tag 8
  if (categoryName === "Sports & Recreation") return 18; // Physical Fitness is tag 18
  if (categoryName === "Professional Development & Networking") return 2; // Professional Networking is tag 2
  if (categoryName === "Technology & Engineering") return 29; // Technology & Computing is tag 29
  if (categoryName === "Health & Wellness") return 22; // Health & Wellness is tag 22
  if (categoryName === "Academic & Educational") return 3; // Academic Support is tag 3
  
  console.warn(`Unknown category: ${categoryName}, defaulting to Academic Support`);
  return 3; // Default to Academic Support instead of Leadership
}
