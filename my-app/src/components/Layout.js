import React from 'react';
import Navigation from './Navigation';

function Layout({ children, showHeader = true }) {
  return (
    <div className="App">
      {showHeader && (
        <header>
          <div className="logo-title-container">
            <h1 className="matchmaker-title">Cal Poly<br />Matchmaker</h1>
          </div>
        </header>
      )}
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
