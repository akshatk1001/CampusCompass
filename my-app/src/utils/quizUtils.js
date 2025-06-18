import { TAG_LIST } from '../data/tags';
import { CATEGORY_QUESTIONS } from '../data/questions';

/**
 * calcUserTagScores
 * -------------------
 * Computes the average score for each tag based on the user responses.
 *
 * @param {Object} userTags - Dictionary where keys are tag IDs and values are arrays of responses.
 * @returns {Object} finalScores - Averaged and adjusted score for each tag.
 */
export function calcUserTagScores(userTags) {
  let rawAverages = {};
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
 */
export function cosineSimilarity(vecA, vecB) {
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
 */
export function keepColumnsAsArray(data, columnsToKeep, mapping) {
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
 */
export function rankClubsBySimilarity(userVector, clubDataObj, userIdentityCols) {
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
 */
export function applyCategoryInterestScores(tempUserTags, selectedCategories) {
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
 */
export function renameCategoryToNumber(categoryName) {
  if (categoryName === "Community Service & Advocacy") return 1;
  if (categoryName === "Arts & Culture") return 3;
  if (categoryName === "Sports & Recreation") return 16;
  if (categoryName === "Professional Development & Networking") return 2;
  if (categoryName === "Technology & Engineering") return 14;
  if (categoryName === "Health & Wellness") return 11;
  return 1;
}
