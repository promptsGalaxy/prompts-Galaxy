import React from "react";
function SearchBar({ search, setSearch }) {
  return (
    <input
      autoFocus
      type="text"
      placeholder="Search prompts..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.target.blur();
        }
      }}
    />
  );
}

export default SearchBar;
