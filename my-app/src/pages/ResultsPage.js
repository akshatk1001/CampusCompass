import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useQuiz } from '../context/QuizContext';

/**
 * ResultsPage component.
 *
 * Makes sure results are ready and returns the top 10 club matches along with
 * corresponding information for each club (links, name, match percentage, etc)
 * 
 * Users have the option to retake quiz and to view all clubs.
 *
 * @component
 * 
 * @returns {JSX.Element} results UI or null
 */
function ResultsPage() {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();

  // Redirect if results aren't ready
  if (!state.identityCompleted || state.topClubs.length === 0) {
    navigate('/');
    return null;
  }

  const handleRetakeQuiz = () => {
    dispatch({ type: 'RESET_QUIZ' });
    navigate('/');
  };

  const handleViewAllClubs = () => {
    window.open("https://now.calpoly.edu/organizations", "_blank");
  };

  return (
    <Layout>
      <div className="results-container">
        <h2 className="top-matches-title">🎉 Here are your top club matches!</h2>
        
        <div className="action-buttons">
          <button 
            className="action-button primary"
            onClick={handleViewAllClubs}
          >
            View All Cal Poly Clubs
          </button>
          <button 
            className="action-button secondary"
            onClick={handleRetakeQuiz}
          >
            Retake Quiz
          </button>
        </div>

        <div className="club-list">
          {state.topClubs.map((club, index) => (
            <div key={index} className="club-item">
              <div className="club-rank">#{index + 1}</div>
              <h3 className="club-name">{club.clubName}</h3>
              <div className="match-percentage">
                <span className="match-label">Match Score:</span>
                <span className="match-score">{(club.similarity * 100).toFixed(1)}%</span>
              </div>
              <button 
                className="club-link-button"
                onClick={() => window.open(`${club.clubLink}`, "_blank")}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>

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
