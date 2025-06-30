/**
 * @typedef {Object} QuizState
 * @property {Array<Object>}   clubData
 *   – list of all clubs
 * @property {Object<string, any[]>} userTags
 *   – map tagId → array of responses
 * @property {Array<string>}   selectedCategories
 *   – up to 3 chosen category IDs
 * @property {Array<any>}      userIdentityResponses
 *   – answers to identity questions
 * @property {number}          currentCategoryIndex
 *   – which category we’re on
 * @property {number}          currentQuestionIndex
 *   – which question in that category
 * @property {Array<Object>}   topClubs
 *   – the top 10 clubs recommended at the end
 * @property {boolean}         quizStarted
 *   – has the quiz begun?
 * @property {boolean}         surveyComplete
 *   – have we finished all questions in our categories?
 * @property {boolean}         identityCompleted
 *   – have identity questions been answered?
 * @property {boolean}         showIdentityQuestions
 *   – whether to show the identity screen based on user response
 * @property {boolean}         loading
 *   – is data still loading?
 * @property {Error|null}      error
 *   – any loading error
 */

/**
 * @typedef {Object} QuizAction
 * @property {string} type
 *   – Which transition to perform (e.g. "SET_CLUB_DATA") // in the reducer
 * @property {*} [payload]
 *   – Any data required by that transition (optional field)
 */

/**
 * @typedef {Object} QuizContextValue
 * @property {QuizState}                   state
 *   – The current quiz state object.
 * @property {function(QuizAction): void}  dispatch
 *   – The reducer dispatch function for updating state.
 */
