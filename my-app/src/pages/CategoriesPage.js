import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORY_QUESTIONS } from '../data/questions';
import './CategoriesPage.css';

/**
 * CategoriesPage Component
 * 
 * Displays a grid of all available quiz categories, allowing users to explore
 * different club categories before taking the full quiz. This page serves as
 * a "browsing" experience where users can see what types of categories exist 
 * and their questions.
 * 
 * Features:
 * - Visual grid layout with category cards
 * - Each card shows icon, title, description, and question count
 * - Links to individual category detail pages
 * - Call-to-action to start the full quiz
 * - Breadcrumb navigation
 * 
 * Route: /categories
 * Used by: Navigation component, category detail pages
 */
function CategoriesPage() {
  // Extract all category names from the questions data
  const categories = Object.keys(CATEGORY_QUESTIONS);

  /**
   * Converts a category name into a URL-friendly slug
   * Example: "Community Service & Advocacy" → "community-service-advocacy"
   * 
   * @param {string} categoryName - The full category name
   * @returns {string} URL-safe slug for routing
   */
  const getCategorySlug = (categoryName) => {
    return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'); // lowercase and replace non-alphanumeric characters with hyphens
  };

  /**
   * Returns a descriptive text for each category to help users understand
   * what types of clubs and activities they can expect to find
   * 
   * @param {string} categoryName - The category to get description for
   * @returns {string} User-friendly description of the category
   */
  const getCategoryDescription = (categoryName) => {
    const descriptions = {
      "Community Service & Advocacy": "Get involved in making a difference through volunteer work, activism, and community engagement.",
      "Arts & Culture": "Explore your creative side through visual arts, performing arts, and cultural experiences.",
      "Sports & Recreation": "Stay active and compete in various sports, from team competitions to outdoor adventures.",
      "Professional Development & Networking": "Build your career through networking, leadership opportunities, and professional skills.",
      "Technology & Engineering": "Dive into coding, innovation, and technical projects that shape the future.",
      "Health & Wellness": "Focus on physical and mental well-being through fitness, mindfulness, and health advocacy.",
      "Academic & Educational": "Expand your learning through research, tutoring, and educational outreach."
    };
    return descriptions[categoryName] || "Explore opportunities in this exciting category.";
  };

  /**
   * Returns an emoji icon for each category to make the interface more
   * visually appealing and help users quickly identify category types
   * 
   * @param {string} categoryName - The category to get icon for
   * @returns {string} Emoji icon representing the category
   */
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Community Service & Advocacy": "🤝",
      "Arts & Culture": "🎨",
      "Sports & Recreation": "🏃‍♂️",
      "Professional Development & Networking": "💼",
      "Technology & Engineering": "💻",
      "Health & Wellness": "🧘‍♀️",
      "Academic & Educational": "📚"
    };
    return icons[categoryName] || "🎯"; // Default icon if category not found
  };

  return (
    <Layout>
      <div className="categories-page">
        {/* Breadcrumb navigation to help users understand their location */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Categories
        </div>
        
        {/* Page header with title and explanatory subtitle */}
        <h1 className="page-title">Browse Categories</h1>
        <p className="page-subtitle">
          Explore different club categories to find organizations that match your interests.
        </p>

        {/* Grid layout displaying all available categories as clickable cards */}
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category}
              to={`/category/${getCategorySlug(category)}`} // Navigate to individual category page
              className="category-card"
            >
              {/* Visual icon to quickly identify the category type */}
              <div className="category-icon">{getCategoryIcon(category)}</div>
              
              {/* Category name as the main heading */}
              <h3 className="category-card-title">{category}</h3>
              
              {/* Descriptive text explaining what this category involves */}
              <p className="category-description">{getCategoryDescription(category)}</p>
              
              {/* Show how many questions are in this category */}
              <div className="question-count">
                {CATEGORY_QUESTIONS[category].length} questions
              </div>
            </Link>
          ))}
        </div>

        {/* Call-to-action footer encouraging users to take the full quiz */}
        <div className="categories-footer">
          <Link to="/" className="start-quiz-link">
            Ready to take the full quiz?
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default CategoriesPage;
