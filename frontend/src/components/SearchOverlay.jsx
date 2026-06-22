import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/SearchOverlay.css";

function SearchOverlay({ close }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/api/prompts");
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredPosts = posts.filter((item) =>
    item.Prompt?.toLowerCase().includes(search.toLowerCase()),
  );

  const openPrompt = (item) => {
    close();
    navigate(`/prompt/${item.slug}`);
  };

  return (
    <div className="search-overlay">
      <div className="search-header">
        <input
          autoFocus
          type="search"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          enterKeyHint="search"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur(); // Keyboard hide
            }
          }}
        />

        <button onClick={close}>✕</button>
      </div>

      <div className="search-grid">
        {filteredPosts.length > 0
          ? filteredPosts.map((item) => (
              <div
                key={item._id}
                className="search-card"
                onClick={() => openPrompt(item)}
              >
                {item.mediaType === "image" ? (
                  <img src={item.mediaUrl} alt={item.Prompt} />
                ) : (
                  <video src={item.mediaUrl} muted preload="metadata" />
                )}
              </div>
            ))
          : search.trim() && <div className="no-results">No results found</div>}
      </div>
    </div>
  );
}

export default SearchOverlay;
