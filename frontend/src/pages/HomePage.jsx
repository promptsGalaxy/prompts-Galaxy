import { Fragment, useEffect, useState } from "react";
import API from "../api";

import MediaModal from "../components/MediaModal";
import AdCard from "../components/AdCard";

import "../styles/Feed.css";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchTrending();
    fetchAds();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await API.get("/api/trending");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await API.get("/api/ads");
      setAds(res.data);
    } catch (err) {
      console.log("No ads available");
    }
  };

  return (
    <>
      <h2 className="trending-title">🔥 Trending Prompts</h2>

      <div className="feed-grid">
        {posts.map((post, index) => (
          <Fragment key={post._id}>
            <div className="feed-card" onClick={() => setSelectedItem(post)}>
              {post.mediaType === "image" ? (
                <img src={post.mediaUrl} alt="" loading="lazy" />
              ) : (
                <video src={post.mediaUrl} preload="metadata" muted />
              )}
            </div>

            {ads.length > 0 && (index + 1) % 5 === 0 && (
              <div className="feed-ad">
                <AdCard ad={ads[Math.floor(index / 5) % ads.length]} />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <MediaModal
        item={selectedItem}
        closeModal={() => setSelectedItem(null)}
      />
    </>
  );
}

export default HomePage;
