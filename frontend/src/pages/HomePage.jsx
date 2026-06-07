import { Fragment, useEffect, useRef, useState } from "react";
import API from "../api";

import MediaModal from "../components/MediaModal";
import AdCard from "../components/AdCard";

import "../styles/Feed.css";
import Loader from "../components/Loader";
import { Play } from "lucide-react";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(5);

  const loadMoreRef = useRef(null);

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
    } finally {
      setLoading(false);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && visibleCount < posts.length) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "300px",
      },
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [visibleCount, posts.length]);

  if (loading) {
    return <Loader />;
  }

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <>
      <h2 className="trending-title">🔥 Trending Prompts</h2>

      <div className="feed-grid">
        {visiblePosts.map((post, index) => (
          <Fragment key={post._id}>
            <div className="feed-card" onClick={() => setSelectedItem(post)}>
              {post.mediaType === "image" ? (
                <img src={post.mediaUrl} alt="" loading="lazy" />
              ) : (
                <>
                  <video src={post.mediaUrl} preload="metadata" muted />

                  <div className="video-badge">
                    <Play size={16} fill="white" />
                  </div>
                </>
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

      {visibleCount < posts.length && (
        <div ref={loadMoreRef} className="load-more-trigger">
          <Loader />
        </div>
      )}

      <MediaModal
        item={selectedItem}
        closeModal={() => setSelectedItem(null)}
      />
    </>
  );
}

export default HomePage;
