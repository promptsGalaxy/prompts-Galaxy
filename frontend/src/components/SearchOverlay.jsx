import { useEffect, useState } from "react";
import API from "../api";
import "../styles/SearchOverlay.css";

function SearchOverlay({ close, openMedia }) {
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

  return (
    <div className="search-overlay">
      <div className="search-header">
        <input
          autoFocus
          type="text"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={close}>✕</button>
      </div>

      <div className="search-grid">
        {filteredPosts.length > 0
          ? filteredPosts.map((item) => (
              <div
                key={item._id}
                className="search-card"
                onClick={() => openMedia(item)}
              >
                {item.mediaType === "image" ? (
                  <img src={item.mediaUrl} alt="" />
                ) : (
                  <video src={item.mediaUrl} />
                )}
              </div>
            ))
          : search.trim() && <div className="no-results">No results found</div>}
      </div>
    </div>
  );
}

export default SearchOverlay;
