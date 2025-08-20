# CampusCompass - Club Recommendation System

CampusCompass is a React-based web application that helps students find clubs and organizations that match their interests and identity. The system uses machine learning to analyze club descriptions and creates personalized recommendations based on user preferences.

## 🎯 Overview

The application works in two main phases:
1. **Data Processing Phase**: Python scripts analyze club data and generate similarity scores
2. **User Interface Phase**: React app provides an interactive quiz and displays recommendations

## 📁 Project Structure

```
my-app/
├── public/
│   └── csv_folder/           # CSV data files
│       ├── newTagsWithIdentity.csv  # Main club data with scores
│       └── tagsAndIdentity.csv      # Backup/alternative data
├── src/
│   ├── components/           # Reusable UI components
│   ├── context/             # React context for state management
│   ├── data/                # Configuration files
│   │   ├── questions.js     # Quiz questions by category
│   │   ├── tags.js          # Interest tag definitions
│   │   └── identity.js      # Identity questions and options
│   ├── pages/               # Main application screens
│   ├── styles/              # CSS styling
│   └── utils/               # Core algorithm logic
│       └── quizUtils.js     # Recommendation algorithms
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Running
```bash
cd my-app
npm install
npm start
```

The application will open at `http://localhost:3000`

## 📊 Data Pipeline: From Club Data to Recommendations

### Step 1: Generate Club Data CSV

**File**: `../AllTagging.py` (located in parent directory)

This Python script processes raw club data and generates similarity scores:

```bash
# Run from the parent directory (CampusCompass/)
python AllTagging.py
```

**What it does:**
- Reads `NicosScrapedData.csv` (raw club data)
- Uses machine learning (SentenceTransformers) to analyze club descriptions
- Generates similarity scores for both interest tags AND identity characteristics:
  - **Interest tags**: 42 categories like "Leadership", "Technology", "Community Service"
  - **Identity characteristics**: Race/ethnicity, gender, Greek life, LGBTQ+, religion, academic majors
- Applies threshold-based processing for identity categories
- Outputs `newTagsWithIdentity.csv`

**Key configurations in the script:**
- **Race threshold**: 0.6 (line ~240)
- **Gender threshold**: 0.575 (line ~241)
- **LGBTQ threshold**: 0.65 (line ~243)
- **Greek life**: Keyword-based detection (line ~242)

### Step 2: Move CSV to React App

After running `AllTagging.py`, copy the output file:

```bash
# Copy the generated CSV to the React app
cp newTagsWithIdentity.csv my-app/public/csv_folder/newTagsWithIdentity.csv
```

**Important**: The CSV must be in `public/csv_folder/` because React can only access files in the `public` directory at runtime.

## 🎯 Core System Components

### 1. Tags System (`src/data/tags.js`)

Defines 42 interest categories that clubs are scored against:

```javascript
export const ALL_TAGS = {
  1: ["Leadership", 1],
  2: ["Teamwork", 2],
  3: ["Community Service", 3],
  // ... 39 more tags
  42: ["Robotics & AI", 42]
};
```

**To modify tags:**
1. Edit the `ALL_TAGS` object in `tags.js`
2. Update questions in `questions.js` to reference new tag IDs
3. Re-run the tagging scripts with new tag categories

### 2. Questions System (`src/data/questions.js`)

Organizes quiz questions by category. Each question maps to specific tag IDs:

```javascript
export const CATEGORY_QUESTIONS = {
  "Community Service & Advocacy": [
    ["Are you interested in direct volunteering?", [3, 2, 25]],
    // Question text maps to array of relevant tag IDs
  ]
};
```

**To modify questions:**
1. Edit question text
2. Update the associated tag ID arrays
3. Ensure tag IDs exist in `tags.js`

### 3. Identity System (`src/data/identity.js`)

Defines demographic and background questions:

```javascript
export const IDENTITY_OPTIONS = {
  "What gender do you identify with?": [
    { value: 'man men', label: 'Male' },
    { value: 'woman women', label: 'Female' }
  ]
};
```

**Important**: The `value` field must match column names in the CSV data exactly.

## 🔧 Making Changes for Different Use Cases

### Adding New Interest Tags

1. **Update tags.js**:
```javascript
export const ALL_TAGS = {
  // existing tags...
  43: ["New Interest Category", 43]
};
```

2. **Update questions.js**:
```javascript
["New question about the interest?", [43, 2, 5]]
```

3. **Update data processing**:
   - Modify `TaggingClubs.py` to include the new tag
   - Re-run the tagging process
   - Update CSV file

### Changing Main Categories and Tag Associations

The system organizes questions into main categories (like "Community Service & Advocacy", "Arts & Culture", etc.). Each category contains questions that map to specific tags. Here's how to modify this structure:

**File**: `src/data/questions.js`

#### Adding a New Main Category:

```javascript
export const CATEGORY_QUESTIONS = {
  // existing categories...
  "New Category Name": [
    ["Question about interest 1?", [tag1, tag2, tag3]],
    ["Question about interest 2?", [tag4, tag5]],
    ["Question about interest 3?", [tag1, tag6, tag7]]
  ]
};
```

#### Modifying Existing Categories:

1. **Change category name**: Update the key in `CATEGORY_QUESTIONS`
2. **Add/remove questions**: Add or remove question arrays within a category
3. **Change tag associations**: Modify the tag ID arrays for each question

#### Example - Restructuring "Technology & Engineering":

```javascript
"Technology & Engineering": [
  // Old question
  ["Are you interested in competitive coding?", [7, 40, 18]],
  // New question with different tag focus
  ["Do you want to build mobile apps?", [7, 40, 15, 38]],
  // Completely new question
  ["Are you interested in data science and analytics?", [7, 16, 22, 40]]
]
```

#### Important Considerations:

- **Tag IDs must exist** in `tags.js` - verify all referenced tag IDs are defined
- **Question distribution** - ensure each tag appears in multiple questions for better scoring
- **Category balance** - try to have 6-8 questions per category for good user experience
- **Update UI** - if you change category names, update any hardcoded references in React components

#### Required Code Changes When Modifying Categories:

When you change main categories, you **must** update these functions:

**1. Update `renameCategoryToNumber` function** (`src/utils/quizUtils.js`, line ~442):

```javascript
export function renameCategoryToNumber(categoryName) {
  if (categoryName === "Your New Category Name") return 25; // Map to appropriate tag ID
  if (categoryName === "Community Service & Advocacy") return 4;
  if (categoryName === "Arts & Culture") return 8;
  // ... existing mappings
}
```

**2. If you remove categories**, delete the corresponding mapping lines.

**3. If you change category names**, update both the condition and keep the same tag number:

```javascript
// Old:
if (categoryName === "Sports & Recreation") return 18;
// New:
if (categoryName === "Athletics & Fitness") return 18; // Same tag ID, new name
```

#### Why This Matters:

The `renameCategoryToNumber` function is used by `applyCategoryInterestScores` to give bonus points when users select categories on the home page. If the mapping is wrong:
- Users won't get bonus scores for their selected categories
- The recommendation algorithm will be less accurate
- The app may show unexpected results

#### Testing Your Changes:

1. Run the app and navigate through categories
2. Complete a quiz and verify tags are scored correctly
3. Check that club recommendations reflect the new category structure
4. **Test category selection**: Select categories on home page and verify they influence results

### Modifying Identity Categories

1. **Update identity.js**:
```javascript
export const IDENTITY_OPTIONS = {
  "New identity question?": [
    { value: 'csv_column_name', label: 'Display Name' }
  ]
};
```

2. **Update CSV columns**: Ensure the CSV has matching column names

3. **Update Python processing**: Modify `AllTagging.py` to handle new categories

#### Required Code Changes When Modifying Identities:

When you add, remove, or change identity categories, you **must** update these components:

**1. Update `ONLY_IDENTITIES` array** (`src/data/identity.js`, line ~124):

```javascript
export const ONLY_IDENTITIES = [
  ["man men", "woman women"],
  ["White European Italian", "Black African American", "Native American", "Asian", "Hispanic", "Native Hawaiian or Other Pacific Islander"],
  // Add your new identity group here:
  ["New Identity Value 1", "New Identity Value 2", "New Identity Value 3"],
  ["Christian", "Jewish Community and Judaism", "Islam", "Hindu", "Buddhism"],
  ["lgbtq"],
  ["Greek"]
]
```

**2. Update the Python processing script** (`AllTagging.py`):
- Add new identity categories to the `all_identities` list
- Add corresponding threshold functions if needed
- Update the `main()` function to process new categories

**3. Update the CSV structure**:
- Ensure your CSV has columns matching the new identity values
- Run `AllTagging.py` to regenerate the CSV with new columns

#### Why `ONLY_IDENTITIES` Matters:

The `ONLY_IDENTITIES` array is used by the `getRelevantIdentities` function in `quizUtils.js`. It:
- Groups related identity options together
- Expands user selections to include all related identities in a group
- Ensures proper filtering and matching in the recommendation algorithm

#### Example - Adding a New Identity Category:

Let's say you want to add "Year in School":

**1. Add to `IDENTITY_QUESTIONS`**:
```javascript
export const IDENTITY_QUESTIONS = {
  "Identity": [
    // existing questions...
    "What year are you in school?"
  ]
};
```

**2. Add to `IDENTITY_OPTIONS`**:
```javascript
"What year are you in school?": [
  { value: 'Freshman', label: 'Freshman' },
  { value: 'Sophomore', label: 'Sophomore' },
  { value: 'Junior', label: 'Junior' },
  { value: 'Senior', label: 'Senior' },
  { value: 'Graduate', label: 'Graduate Student' },
  { value: 'other', label: 'Other/Decline To Say' }
]
```

**3. Add to `ONLY_IDENTITIES`**:
```javascript
export const ONLY_IDENTITIES = [
  // existing groups...
  ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"], // New group
  ["Greek"]
]
```

**4. Update `AllTagging.py`**:
```python
all_identities = [
    # existing identities...
    "Freshman",
    "Sophomore", 
    "Junior",
    "Senior",
    "Graduate"
]
```

#### Testing Identity Changes:

1. **Test the identity page**: Verify new questions appear correctly
2. **Test selection**: Ensure new identity options can be selected
3. **Test CSV generation**: Run `AllTagging.py` and verify new columns exist
4. **Test recommendations**: Complete a quiz and verify identity filtering works
5. **Check console**: Look for warnings about missing columns or identity mismatches

### Changing Similarity Algorithm

**File**: `src/utils/quizUtils.js`, `cosineSimilarity` function

The current algorithm uses cosine similarity. To modify:

```javascript
export function cosineSimilarity(vecA, vecB) {
  // Current: cosine similarity (angle between vectors)
  // Alternative: Euclidean distance, Manhattan distance, etc.
}
```

### Adjusting Club Ranking

**File**: `src/utils/quizUtils.js`, `rankClubsBySimilarity` function

Key areas to modify:

1. **Identity weight** (line ~280):
```javascript
if (userIdentityCols.includes(identitiesToInclude[i])) {
  userVector.push(2.0); // Increase for stronger identity weighting
}
```

2. **Number of results** (line ~320):
```javascript
.slice(0, 10) // Change to show more/fewer recommendations
```

3. **Minimum similarity threshold**:
```javascript
.filter(club => club.similarity > 0.3) // Only show clubs above threshold
```

## 🎨 UI Customization

### Adding New Quiz Categories

1. **Update questions.js** with new category:
```javascript
"New Category Name": [
  ["Question 1?", [tag1, tag2]],
  ["Question 2?", [tag3, tag4]]
]
```

2. **Update CategoriesPage.js** if you want custom category descriptions

### Styling and Themes

- Global styles: `src/styles/global.css`
- Component-specific styles: `src/pages/*.css` and `src/components/*.css`

## 🐛 Common Issues and Solutions

### CSV File Not Loading
- Ensure the CSV is in `public/csv_folder/`
- Check that column names match exactly with identity.js values
- Verify CSV is properly formatted (no extra commas, quotes)

### Tags Not Appearing in Results
- Check that tag IDs in questions.js exist in tags.js
- Verify the CSV has columns for all referenced tags
- Ensure the tag scoring in Python scripts includes your tags

### Identity Filtering Not Working
- Confirm identity values in identity.js match CSV column names exactly
- Check that the Python processing script handles your identity categories
- Verify CSV data has 1.0/0.0 values for identity columns

### Low Similarity Scores
- Increase the boost multiplier in calcUserTagScores
- Lower the minimum questions threshold for boosting
- Adjust identity weighting in rankClubsBySimilarity

## 📝 Development Workflow

### For New Semesters/Schools:

1. **Update club data**:
   - Replace `NicosScrapedData.csv` with new club information
   - Run `TaggingClubIdentity.py`
   - Copy output to `my-app/public/csv_folder/`

2. **Adjust for local context**:
   - Modify identity categories in `identity.js`
   - Update questions in `questions.js` for relevant activities
   - Adjust tags in `tags.js` for available club types

3. **Test and validate**:
   - Run the React app
   - Test with various user profiles
   - Verify recommendations make sense

### For Different Organizations:

1. **Corporate version**: Focus on professional development tags
2. **High school version**: Adjust maturity level of questions and categories
3. **Community groups**: Emphasize local service and cultural activities

## 🔄 Data Flow Summary

```
Raw Club Data → Python ML Processing → CSV with Scores → React App → User Quiz → Similarity Matching → Recommendations
```

1. **Input**: Club descriptions and details
2. **Processing**: Machine learning analysis creates numerical scores
3. **Storage**: CSV file with all club data and scores
4. **Interface**: React app presents quiz to users
5. **Algorithm**: Cosine similarity matches user preferences to clubs
6. **Output**: Ranked list of recommended clubs

This system provides a scalable foundation for any club or organization recommendation platform!

---

## Create React App Information

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

#### `npm start`
Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it.

#### `npm test`
Launches the test runner in interactive watch mode.

#### `npm run build`
Builds the app for production to the `build` folder.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
