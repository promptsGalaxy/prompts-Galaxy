import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import "../styles/CategoryPrompts.css";

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

export default function CategoryPrompts() {
  const { slug } = useParams();

  const [prompts, setPrompts] = useState([]);

  const [categoryName, setCategoryName] = useState(slug);

  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const icon = categoryIcons[slug?.toLowerCase()] || "✨";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setPage(1);
  }, [slug]);

  useEffect(() => {
    fetchCategoryPrompts();
  }, [slug, page]);

  const fetchCategoryPrompts = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await fetch(
        `${API_URL}/api/prompts/category/${encodeURIComponent(
          slug,
        )}?page=${page}&limit=24`,
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setPrompts(data.prompts || []);

      setTotal(data.total || 0);

      setTotalPages(data.totalPages || 1);

      if (data.prompts && data.prompts.length > 0) {
        if (data.prompts[0].Category) {
          setCategoryName(data.prompts[0].Category);
        }
      }
    } catch (err) {
      console.error("Category Prompts Error:", err);

      setError("Unable to load prompts for this category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="category-prompts-page">
      {/* =========================
          HEADER
      ========================= */}

      <section className="category-prompts-hero">
        <div className="category-prompts-inner">
          <Link to="/categories" className="category-back">
            ← All Categories
          </Link>

          <div className="category-large-icon">{icon}</div>

          <h1>{categoryName} AI Prompts</h1>

          <p>
            Discover creative AI image and video prompts from the {categoryName}{" "}
            category.
          </p>

          {!loading && !error && (
            <div className="category-total">{total} prompts available</div>
          )}
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="category-prompts-container">
        {/* LOADING */}

        {loading && (
          <div className="category-loading">
            <div className="category-spinner" />

            <p>Loading prompts...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="category-error">
            <div>⚠️</div>

            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button onClick={fetchCategoryPrompts}>Try Again</button>
          </div>
        )}

        {/* EMPTY */}

        {!loading && !error && prompts.length === 0 && (
          <div className="category-empty">
            <div>✨</div>

            <h2>No prompts found</h2>

            <p>There are no prompts available in this category yet.</p>

            <Link to="/categories">Explore Other Categories</Link>
          </div>
        )}

        {/* GRID */}

        {!loading && !error && prompts.length > 0 && (
          <>
            <div className="category-prompt-grid">
              {prompts.map((prompt) => (
                <article key={prompt._id} className="category-prompt-card">
                  {/* MEDIA */}

                  {prompt.mediaUrl && (
                    <Link
                      to={`/prompt/${prompt.slug || prompt._id}`}
                      className="category-prompt-media"
                    >
                      {prompt.mediaType === "video" ? (
                        <video
                          src={prompt.mediaUrl}
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={prompt.mediaUrl}
                          alt={
                            prompt.description || `${categoryName} AI prompt`
                          }
                          loading="lazy"
                        />
                      )}
                    </Link>
                  )}

                  {/* CONTENT */}

                  <div className="category-prompt-content">
                    <span className="category-prompt-type">
                      {prompt.mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                    </span>

                    <h2>{prompt.description || `${categoryName} AI Prompt`}</h2>

                    <p>
                      {prompt.Prompt
                        ? prompt.Prompt.slice(0, 140)
                        : "Creative AI prompt"}

                      {prompt.Prompt && prompt.Prompt.length > 140 ? "..." : ""}
                    </p>

                    <Link
                      to={`/prompt/${prompt.slug || prompt._id}`}
                      className="view-prompt-button"
                    >
                      View Prompt →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="category-pagination">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((previous) => Math.max(previous - 1, 1))
                  }
                >
                  ← Previous
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((previous) => Math.min(previous + 1, totalPages))
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
