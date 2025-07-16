// React is the main library - we need this in every component file
import React from 'react';
// useNavigate lets us programmatically move to different pages (when our code decides to navigate)
import { useNavigate } from 'react-router-dom';
// Layout is our custom component that wraps the page with header/navigation
import Layout from '../components/Layout';
// useQuiz is our custom hook that gives us access to quiz data from anywhere in the app
import { useQuiz } from '../context/QuizContext';
// Import the CSS styles for this specific page
import './ResultsPage.css';

/**
 * ResultsPage Component
 * 
 * What this page does:
 * - Shows the top 10 clubs that best match the user's quiz answers
 * - Displays each club with a "match score" (like 85% match)
 * - Provides links to learn more about each club
 * - Offers options to retake the quiz or browse all clubs
 * - Only shows if the user completed the entire quiz flow
 * 
 * How we got here:
 * 1. User selected categories on HomePage
 * 2. User answered quiz questions on QuizPage
 * 3. User optionally answered identity questions on IdentityPage
 * 4. Complex algorithm calculated which clubs match their preferences
 * 5. Now we show the results!
 * 
 * What the "match scores" mean:
 * - Each club has characteristics (like "teamwork-focused", "competitive", "creative")
 * - We compared the user's preferences to each club's characteristics
 * - Higher percentage = better match for their interests
 * - 90%+ = excellent match, 70%+ = good match, 50%+ = okay match
 * 
 * @returns {JSX.Element} The rendered ResultsPage component (JSX is like HTML but in JavaScript)
 */
function ResultsPage() {
  // HOOKS: These are special React functions that let us use state and other features
  
  // useQuiz() connects us to our global quiz data storage
  // 'state' = current quiz data (like the calculated club matches)
  // 'dispatch' = function to update/change the quiz data
  const { state, dispatch } = useQuiz();
  
  // useNavigate() gives us a function to move between pages programmatically
  // We use this for automatic redirects (when our code decides to navigate)
  const navigate = useNavigate();

  // ROUTE PROTECTION: Make sure user should be on this page
  // Only allow access if they completed both the quiz AND identity phase
  // Also make sure we actually have results to show them
  if (!state.identityCompleted || state.topClubs.length === 0) {
    navigate('/'); // Send them back to home page if they shouldn't be here
    return null; // Don't render anything while navigating
  }

  // EVENT HANDLERS: These are functions that run when user interacts with the page
  
  /**
   * Handles when user clicks "Retake Quiz"
   * Completely resets the quiz and starts over from the beginning
   * 
   * What happens:
   * - Clears all their previous answers
   * - Resets all quiz progress back to initial state
   * - Takes them back to the home page to select categories again
   * - Like hitting a "restart" button on a video game
   */
  const handleRetakeQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' }); // Clear all quiz data
    navigate('/'); // Go back to the beginning
  };

  /**
   * Handles when user clicks "View All Cal Poly Clubs"
   * Opens the official Cal Poly organizations page in a new browser tab
   * 
   * What happens:
   * - window.open() opens a new browser tab (doesn't leave our app)
   * - "_blank" means "open in new tab" (keeps our app open too)
   * - Lets them browse ALL clubs, not just their matches
   * - Like a backup option if they want to explore more
   */
  const handleViewAllClubs = () => {
    window.open("https://now.calpoly.edu/organizations", "_blank");
  };

  // MAIN RENDER: This is what users see - their personalized club recommendations!
  return (
    <Layout>
      {/* Layout wraps our content with the header/navigation */}
      
      <div className="results-container">
        {/* 
          CELEBRATION HEADER: Exciting title with emoji to make it feel rewarding
        */}
        <h2 className="top-matches-title">🎉 Here are your top club matches!</h2>
        
        {/* 
          ACTION BUTTONS: Give users options for what to do next
          These appear at the top so users see their options right away
        */}
        <div className="action-buttons">
          <button 
            className="action-button primary" // "primary" = more important button (stands out more)
            onClick={handleViewAllClubs} // Run our function when clicked
          >
            View All Cal Poly Clubs
          </button>
          <button 
            className="action-button secondary" // "secondary" = less important button (more subtle)
            onClick={handleRetakeQuiz} // Run our function when clicked
          >
            Retake Quiz
          </button>
        </div>

        {/* 
          THE MAIN EVENT: List of their personalized club matches
        */}
        <div className="club-list">
          {/* 
            MAP FUNCTION: Loop through each recommended club and create a card for it
            .map() takes each item in an array and transforms it into something else
            Here: each club object → a visual club card
            
            state.topClubs looks like:
            [
              { clubName: "Chess Club", similarity: 0.85, clubLink: "https://..." },
              { clubName: "Hiking Club", similarity: 0.82, clubLink: "https://..." },
              ...
            ]
          */}
          {state.topClubs.map((club, index) => (
            <div key={index} className="club-item"> {/* Each club gets its own card */}
              {/* 
                RANKING NUMBER: Shows #1, #2, #3, etc.
                index starts at 0, so we add 1 to make it human-readable
                Makes it feel like a "top 10" list
              */}
              <div className="club-rank">#{index + 1}</div>
              
              {/* 
                CLUB NAME: The actual name of the club
                This is the main identifier users will recognize
              */}
              <h3 className="club-name">{club.clubName}</h3>
              
              {/* 
                MATCH SCORE: How well this club matches their interests
                club.similarity is a decimal like 0.85, we convert to percentage like 85%
                .toFixed(1) rounds to 1 decimal place: 85.3% instead of 85.2847%
              */}
              <div className="match-percentage">
                <span className="match-label">Match Score:</span>
                <span className="match-score">{(club.similarity * 100).toFixed(1)}%</span>
              </div>
              
              {/* 
                LEARN MORE BUTTON: Takes them to the club's official page
                Each club has its own website/page where they can get more info
                Opens in new tab so they don't lose their results
              */}
              <button 
                className="club-link-button"
                // Template literal: `${club.clubLink}` inserts the actual URL
                onClick={() => window.open(`${club.clubLink}`, "_blank")}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>

        {/* 
          FOOTER MESSAGE: Helpful guidance about what to do with these results
          Encourages exploration and explains they can try again if unsatisfied
        */}
        <div className="results-footer">
          <p>
            These matches are based on your interests and preferences. 
            Don't see something you like? Try retaking the quiz with different categories!
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default ResultsPage;
