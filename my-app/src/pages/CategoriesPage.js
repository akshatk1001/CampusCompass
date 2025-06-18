import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORY_QUESTIONS } from '../data/questions';

function CategoriesPage() {
  const categories = Object.keys(CATEGORY_QUESTIONS);

  const getCategorySlug = (categoryName) => {
    return categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'); // lowercase and replace non-alphanumeric characters with hyphens
  };

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
    return icons[categoryName] || "🎯";
  };

  return (
    <Layout>
      <div className="categories-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Categories
        </div>
        
        <h1 className="page-title">Browse Categories</h1>
        <p className="page-subtitle">
          Explore different club categories to find organizations that match your interests.
        </p>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category}
              to={`/category/${getCategorySlug(category)}`}
              className="category-card"
            >
              <div className="category-icon">{getCategoryIcon(category)}</div>
              <h3 className="category-card-title">{category}</h3>
              <p className="category-description">{getCategoryDescription(category)}</p>
              <div className="question-count">
                {CATEGORY_QUESTIONS[category].length} questions
              </div>
            </Link>
          ))}
        </div>

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
