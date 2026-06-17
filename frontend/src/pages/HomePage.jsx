import { useEffect, useRef, useState } from "react";
import API from "../api";
import Masonry from "react-masonry-css";

import MediaModal from "../components/MediaModal";
import AdCard from "../components/AdCard";
import Loader from "../components/Loader";

import "../styles/Feed.css";

import { Play } from "lucide-react";

function HomePage() {
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  const loadMoreRef = useRef(null);

  const breakpointColumnsObj = {
    default: 4,
    1400: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

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
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < posts.length) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "400px",
      },
    );

    const current = loadMoreRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [visibleCount, posts.length]);

  if (loading) {
    return <Loader />;
  }

  const visiblePosts = posts.slice(0, visibleCount);

  const feedItems = [];

  visiblePosts.forEach((post, index) => {
    feedItems.push({
      type: "post",
      data: post,
    });

    // Every 8 posts ki oka ad
    if (ads.length > 0 && (index + 1) % 5 === 0) {
      feedItems.push({
        type: "ad",
        data: ads[Math.floor(index / 5) % ads.length],
      });
    }
  });

  return (
    <>
      <h2 className="trending-title">Prompts Gallery</h2>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {feedItems.map((item, index) => {
          if (item.type === "ad") {
            return (
              <div key={`ad-${index}`} className="feed-ad">
                <AdCard ad={item.data} />
              </div>
            );
          }

          return (
            <div
              key={item.data._id}
              className="feed-card"
              onClick={() => setSelectedItem(item.data)}
            >
              {item.data.mediaType === "image" ? (
                <img src={item.data.mediaUrl} alt="" loading="lazy" />
              ) : (
                <>
                  <video src={item.data.mediaUrl} preload="metadata" muted />

                  <div className="video-badge">
                    <Play size={16} fill="white" />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Masonry>

      {visibleCount < posts.length && (
        <div ref={loadMoreRef} className="load-more-trigger">
          <Loader />
        </div>
      )}

      <MediaModal
        item={selectedItem}
        closeModal={() => setSelectedItem(null)}
        setSelectedItem={setSelectedItem}
      />
      <h2>see all posts in image section</h2>
    </>
  );
}

export default HomePage;
