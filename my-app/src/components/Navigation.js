import React from 'react';
import { Link, useLocation } from 'react-router-dom';

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
