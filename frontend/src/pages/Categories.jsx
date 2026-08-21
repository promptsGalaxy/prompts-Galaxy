import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "../styles/Categories.css";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================================================
   NORMALIZE SLUG
   ---------------------------------------------------------
   This makes these values equivalent:

   RakshaBandhan
   raksha-bandhan
   raksha_bandhan
   rakshabandhan
   RAKSHA-BANDHAN
========================================================= */

const normalizeSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

/* =========================================================
   CATEGORY ICONS
========================================================= */

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

  // Normalized key
  rakshabandhan: "🪢",
};

/* =========================================================
   CATEGORY DESCRIPTIONS
========================================================= */

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

  // Normalized key
  rakshabandhan: "Creative Raksha Bandhan AI image prompts",
};

/* =========================================================
   CATEGORY SECTIONS
   ---------------------------------------------------------
   Change ONLY this array to control:

   1. Section order
   2. Category order
   3. Which category belongs to which section
========================================================= */

const CATEGORY_SECTIONS = [
  {
    id: "festivals",
    title: "Festivals & Occasions",
    description: "Creative AI prompts for festivals and special occasions",

    categories: ["raksha-bandhan"],
  },

  {
    id: "people",
    title: "People",
    description: "Explore creative AI prompts for individuals",

    categories: ["men", "women"],
  },

  {
    id: "relationships",
    title: "Relationships & Family",
    description: "Beautiful prompts for couples and families",

    categories: ["couple", "family"],
  },

  {
    id: "kids",
    title: "Kids",
    description: "Cute and creative AI prompts for kids",

    categories: ["kid"],
  },

  {
    id: "editing",
    title: "Photo Editing",
    description: "Enhance, transform and edit your photos with AI",

    categories: ["editing"],
  },

  {
    id: "groups",
    title: "Groups",
    description: "Creative AI prompts for group photography",

    categories: ["group"],
  },

  {
    id: "others",
    title: "More Categories",
    description: "More creative and trending AI prompts",

    categories: ["others"],
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function Categories() {
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
     FETCH CATEGORIES
  ========================================================= */

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

      console.log("Categories API Response:", data);

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories Error:", err);

      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredCategories = categories.filter((category) => {
    const text = search.toLowerCase().trim();

    if (!text) {
      return true;
    }

    return (
      category.name?.toLowerCase().includes(text) ||
      category.slug?.toLowerCase().includes(text)
    );
  });

  /* =========================================================
     GET CATEGORY BY SLUG
     ---------------------------------------------------------
     Uses normalizeSlug() so slug format doesn't matter.
========================================================= */

  const getCategory = (slug) => {
    const normalizedSlug = normalizeSlug(slug);

    return filteredCategories.find(
      (category) => normalizeSlug(category.slug) === normalizedSlug,
    );
  };

  /* =========================================================
     GET SECTION CATEGORIES
========================================================= */

  const getSectionCategories = (section) => {
    return section.categories.map((slug) => getCategory(slug)).filter(Boolean);
  };

  /* =========================================================
     RETURN
========================================================= */

  return (
    <main className="categories-page">
      {/* =====================================================
          HERO
      ===================================================== */}

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
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="categories-container">
        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="categories-loading">
            <div className="categories-spinner" />

            <p>Loading categories...</p>
          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="categories-error">
            <div className="error-icon">⚠️</div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button onClick={fetchCategories}>Try Again</button>
          </div>
        )}

        {/* ===================================================
            NO RESULTS
        =================================================== */}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className="categories-empty">
            <div>🔍</div>

            <h3>No categories found</h3>

            <p>Try another search.</p>
          </div>
        )}

        {/* ===================================================
            SECTION-WISE CATEGORY DISPLAY
        =================================================== */}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className="categories-sections">
            {CATEGORY_SECTIONS.map((section) => {
              const sectionCategories = getSectionCategories(section);

              /*
                  If this section has no matching
                  categories, don't display it.
                */

              if (sectionCategories.length === 0) {
                return null;
              }

              return (
                <section key={section.id} className="category-section">
                  {/* =====================================
                        SECTION HEADER
                    ===================================== */}

                  <div className="category-section-header">
                    <div>
                      <h2>{section.title}</h2>

                      <p>{section.description}</p>
                    </div>
                  </div>

                  {/* =====================================
                        CATEGORY GRID
                    ===================================== */}

                  <div className="categories-grid">
                    {sectionCategories.map((category) => {
                      /*
                            Normalize the actual
                            backend slug.
                          */

                      const categoryKey = normalizeSlug(category.slug);

                      const icon = categoryIcons[categoryKey] || "✨";

                      const description =
                        categoryDescriptions[categoryKey] ||
                        `Explore ${category.name} AI prompts`;

                      return (
                        <Link
                          key={category.slug}
                          to={`/categories/${category.slug}`}
                          className="category-card"
                        >
                          {/* TOP */}

                          <div className="category-card-top">
                            <div className="category-icon">{icon}</div>

                            <span className="category-count">
                              {category.count ?? 0}
                            </span>
                          </div>

                          {/* TITLE */}

                          <h3>{category.name}</h3>

                          {/* DESCRIPTION */}

                          <p>{description}</p>

                          {/* EXPLORE */}

                          <div className="category-explore">
                            <span>Explore Prompts</span>

                            <span className="category-arrow">→</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
