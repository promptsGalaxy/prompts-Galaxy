import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Categories.css";

const API_URL = import.meta.env.VITE_API_URL;

const categoryIcons = {
  men: "👨",
  women: "👩",
  couple: "💑",
  kid: "👶",
  kids: "👶",
  editing: "✨",
  family: "👨‍👩‍👧",
  group: "👥",
  others: "🔥",
  RakshaBandhan: "🪢",
};

const categoryDescriptions = {
  men: "Creative AI image and video prompts for men",
  women: "Stylish and creative AI prompts for women",
  couple: "Romantic and beautiful couple AI prompts",
  kid: "Cute and creative AI prompts for kids",
  kids: "Cute and creative AI prompts for kids",
  editing: "AI photo editing and enhancement prompts",
  family: "Beautiful family portrait AI prompts",
  group: "Creative group photography AI prompts",
  others: "More creative and trending AI prompts",
};

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(`${API_URL}/api/categories`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories Error:", err);

      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return true;
    }

    return (
      category.name.toLowerCase().includes(text) ||
      category.slug.toLowerCase().includes(text)
    );
  });

  return (
    <main className="categories-page">
      {/* HERO */}

      <section className="categories-hero">
        <div className="categories-hero-inner">
          <span className="categories-badge">✨ MVR PROMPTS</span>

          <h1>Explore AI Prompt Categories</h1>

          <p>
            Discover creative AI image and video prompts organized into
            categories.
          </p>

          {/* SEARCH */}

          <div className="categories-search">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button type="button" onClick={() => setSearch("")}>
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* CONTENT */}

      <section className="categories-container">
        <div className="categories-heading">
          <div>
            <h2>All Categories</h2>

            {!loading && <p>{categories.length} categories available</p>}
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="categories-loading">
            <div className="categories-spinner" />

            <p>Loading categories...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="categories-error">
            <div className="error-icon">⚠️</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button onClick={fetchCategories}>Try Again</button>
          </div>
        )}

        {/* NO RESULTS */}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className="categories-empty">
            <div>🔍</div>

            <h3>No categories found</h3>

            <p>Try another search.</p>
          </div>
        )}

        {/* CATEGORY GRID */}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className="categories-grid">
            {filteredCategories.map((category) => {
              const icon = categoryIcons[category.slug] || "✨";

              const description =
                categoryDescriptions[category.slug] ||
                `Explore ${category.name} AI prompts`;

              return (
                <Link
                  key={category.slug}
                  to={`/categories/${category.slug}`}
                  className="category-card"
                >
                  <div className="category-card-top">
                    <div className="category-icon">{icon}</div>

                    <span className="category-count">{category.count}</span>
                  </div>

                  <h3>{category.name}</h3>

                  <p>{description}</p>

                  <div className="category-explore">
                    <span>Explore Prompts</span>

                    <span className="category-arrow">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
