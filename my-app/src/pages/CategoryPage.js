import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORY_QUESTIONS } from '../data/questions';

function CategoryPage() {
  const { categorySlug } = useParams();
  
  // Convert slug back to category name
  const categoryName = Object.keys(CATEGORY_QUESTIONS).find(name => 
    name.toLowerCase().replace(/[^a-z0-9]/g, '-') === categorySlug
  );

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

  const questions = CATEGORY_QUESTIONS[categoryName];

  return (
    <Layout>
      <div className="category-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/categories">Categories</Link> / {categoryName}
        </div>
        
        <h1 className="category-title">{categoryName}</h1>
        
        <div className="category-info">
          <h3>Questions in this category:</h3>
          <div className="questions-preview">
            {questions.map((question, index) => (
              <div key={index} className="question-preview">
                <span className="question-number">{index + 1}.</span>
                <span className="question-text">{question[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="category-actions">
          <Link to="/" className="start-with-category-button">
            Start Quiz with this Category
          </Link>
          <Link to="/categories" className="back-to-categories-button">
            Browse Other Categories
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default CategoryPage;
