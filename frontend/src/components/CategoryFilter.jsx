import "../styles/Category.css";

function CategoryFilter({ categories, selectedCategory, setSelectedCategory }) {
  return (
    <div className="category-navbar">
      <button
        className={
          selectedCategory === "all" ? "category-btn active" : "category-btn"
        }
        onClick={() => setSelectedCategory("all")}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat}
          className={
            selectedCategory === cat ? "category-btn active" : "category-btn"
          }
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
