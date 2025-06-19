import React from 'react';
import Navigation from './Navigation';
import './Layout.css';

/**
 * Layout Component
 * 
 * The main layout wrapper that provides consistent structure across all pages.
 * This component implements the "layout pattern" -  where shared UI elements
 * (header, navigation, etc.) are wrapped around page content.
 * 
 * Features:
 * - Consistent header with "Cal Poly Matchmaker" branding
 * - Navigation bar that appears on most pages
 * - Main content area that adapts to different page content
 * - Optional header (can be hidden if needed)
 * 
 * Used by: All page components (HomePage, QuizPage, ResultsPage, etc.)
 * 
 * @param {ReactNode} children - The page content to be rendered inside the layout
 * @param {Boolean} showHeader - Whether to display the header (defaults to true)
 */
function Layout({ children, showHeader = true }) {
  return (
    <div>
      {/* Conditional header rendering - can be hidden for special pages */}
      {showHeader && (
        <header>
          <div className="logo-title-container">
            {/* Main app branding - split across two lines for visual impact */}
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
        </header>
      )}
      
      {/* Navigation component - handles routing between different sections */}
      <Navigation />
      
      {/* Main content area where individual page content gets rendered */}
      <main className="main-content">
        {children} {/* This is where page-specific content appears */}
      </main>
    </div>
  );
}

export default Layout;
