import React from 'react';
import { Link, useLocation } from 'react-router-dom';


/**
 * Navigational component used to toggel bewteen tabs on the homepage 
 * Current tabs are ('Take Quiz' and 'Browse Categories')
 * When taking quiz, this component is hidden
 * @component
 * 
 * @returns {JSX.Element | null}
 *  - Returns navigation bar when not in quiz state, else returns null
 * 
 */
function Navigation() {
  const location = useLocation();
  
  // Don't show navigation during quiz flow
  if (location.pathname === '/quiz' || location.pathname === '/identity') {
    return null;
  }

  return (
    <nav className="navigation">
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Take Quiz
        </Link>
        <Link to="/categories" className={location.pathname.startsWith('/categor') ? 'active' : ''}>
          Browse Categories
        </Link>
      </div>
    </nav>
  );
}

export default Navigation;
