import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

/**
 * Navigation Component
 * 
 * Provides navigation links between different sections of the application.
 * This component intelligently hides itself during the quiz flow to avoid
 * distracting users from completing their assessment.
 * 
 * Features:
 * - Active link highlighting (shows which page user is currently on)
 * - Conditional rendering (hidden during quiz and identity questions)
 * - Responsive design that adapts to mobile screens
 * - Smooth transitions and hover effects
 * 
 * Navigation Routes:
 * - "/" - Take Quiz (home page with category selection)
 * - "/categories" - Browse Categories (explore categories before taking quiz)
 * 
 * Used by: Layout component (appears on most pages except quiz flow)
 */
function Navigation() {
  const location = useLocation(); // Get the current location from React Router
  
  // Don't show navigation during quiz flow to keep users focused
  // Quiz flow includes: /quiz (questions) and /identity (identity questions)
  if (location.pathname === '/quiz' || location.pathname === '/identity') {
    return null; // Render nothing, effectively hiding the navigation
  }

  return (
    <nav className="navigation">
      <div className="nav-links">
        {/* Link to the home page - shows as active when on root path */}
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''} /* set classname to active for CSS styling */
        >
          Take Quiz
        </Link>
        
        {/* Link to categories page - shows as active for any category-related path */}
        <Link 
          to="/categories" 
          className={location.pathname.startsWith('/categor') ? 'active' : ''} /* set classname to active for CSS styling */
        >
          Browse Categories
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;
