import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORY_QUESTIONS } from '../data/questions';
import './CategoryPage.css';

/**
 * CategoryPage Component
 * 
 * Displays detailed information about a specific category, including all
 * the questions that will be asked in that category during the quiz.
 * This allows users to preview what they'll be asked before committing
 * to take the quiz.
 * 
 * Features:
 * - Shows all questions for the selected category
 * - Breadcrumb navigation
 * - Error handling for invalid category slugs
 * - Action buttons to start quiz or browse other categories
 * 
 * Route: /category/:categorySlug
 * Example: /category/community-service-advocacy
 */
function CategoryPage() {
  // Extract the category slug from the URL parameters
  const { categorySlug } = useParams();
  
  /**
   * Convert URL slug back to the original category name
   * We need to find the category name that, when converted to a slug,
   * matches the slug in the URL
   */
  const categoryName = Object.keys(CATEGORY_QUESTIONS).find(name => 
    name.toLowerCase().replace(/[^a-z0-9]/g, '-') === categorySlug
  );

  // Handle case where category slug doesn't match any existing category
  if (!categoryName) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Category not found</h2>
          <Link to="/" className="back-button">Back to Home</Link>
        </div>
      </Layout>
    );
  }

  // Get all questions for this specific category
  const questions = CATEGORY_QUESTIONS[categoryName];

  return (
    <Layout>
      <div className="category-page">
        {/* Breadcrumb navigation showing the path to this page */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / {categoryName}
        </div>
        
        {/* Page title displaying the full category name */}
        <h1 className="category-title">{categoryName}</h1>
        
        {/* Main content section showing all questions in this category */}
        <div className="category-info">
          <h3>Questions in this category:</h3>
          <div className="questions-preview">
            {questions.map((question, index) => (
              <div key={index} className="question-preview">
                {/* Question number for easy reference */}
                <span className="question-number">{index + 1}.</span>
                
                {/* The actual question text (first element of question array) */}
                <span className="question-text">{question[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons for user next steps */}
        <div className="category-actions">
          {/* Start quiz button - currently goes to home, could be enhanced 
              to pre-select this category */}
          <Link to="/" className="start-with-category-button">
            Start Quiz
          </Link>
          
          {/* Back to categories overview */}
          <Link to="/categories" className="back-to-categories-button">
            Browse Other Categories
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default CategoryPage;
