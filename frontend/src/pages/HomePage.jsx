import { useEffect, useRef, useState } from "react";
import API from "../api";
import Masonry from "react-masonry-css";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import AdCard from "../components/AdCard";
import Loader from "../components/Loader";

import "../styles/Feed.css";

import { Play } from "lucide-react";
import Title from "../components/Title";
import Footer from "../components/Footer";

function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(() => {
    const saved = sessionStorage.getItem("home-posts");
    return saved ? JSON.parse(saved) : [];
  });

  const [ads, setAds] = useState(() => {
    const saved = sessionStorage.getItem("home-ads");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(posts.length === 0);
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
    sessionStorage.setItem("visibleCount", visibleCount);
  }, [visibleCount]);

  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem("scrollY", window.scrollY);
    };

    window.addEventListener("scroll", saveScroll);

    return () => window.removeEventListener("scroll", saveScroll);
  }, []);
  useEffect(() => {
    if (!loading && posts.length > 0) {
      const savedVisible = sessionStorage.getItem("visibleCount");

      if (savedVisible) {
        setVisibleCount(Number(savedVisible));
      }

      const savedScroll = sessionStorage.getItem("scrollY");

      if (savedScroll) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: Number(savedScroll),
            behavior: "instant",
          });
        });
      }
    }
  }, [loading, posts]);
  useEffect(() => {
    if (posts.length === 0) {
      fetchTrending();
    }

    if (ads.length === 0) {
      fetchAds();
    }
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await API.get("/api/trending");

      setPosts(res.data);

      sessionStorage.setItem("home-posts", JSON.stringify(res.data));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await API.get("/api/ads");

      setAds(res.data);

      sessionStorage.setItem("home-ads", JSON.stringify(res.data));
    } catch {}
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
    if (ads.length > 0 && (index + 1) % 6 === 0) {
      feedItems.push({
        type: "ad",
        data: ads[Math.floor(index / 6) % ads.length],
      });
    }
  });

  return (
    <>
      <Helmet>
        <title>MVR Prompts | Free AI Image & Video Prompts</title>

        <meta
          name="description"
          content="Discover thousands of free AI image and video prompts for ChatGPT, Midjourney, Flux, Gemini, Kling, Veo, Runway and more. Copy premium prompts instantly on MVR Prompts."
        />

        <meta
          name="keywords"
          content="AI prompts, image prompts, video prompts, ChatGPT prompts, Midjourney prompts, Flux prompts, Kling prompts, Veo prompts, MVR Prompts"
        />
        <link rel="canonical" href="https://mvrprompts.com/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="MVR Prompts | Free AI Image & Video Prompts"
        />
        <meta
          property="og:description"
          content="Discover thousands of free AI image and video prompts."
        />
        <meta property="og:url" content="https://mvrprompts.com/" />
      </Helmet>
      <Title />
      <br />
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
              onClick={() => navigate(`/prompt/${item.data.slug}`)}
            >
              {item.data.mediaType === "image" ? (
                <img
                  src={item.data.mediaUrl}
                  alt={item.data.Prompt}
                  loading="lazy"
                />
              ) : (
                <>
                  <video src={item.data.mediaUrl} preload="metadata" muted />

                  <div className="video-badge">
                    <Play size={16} fill="white" />
                  </div>
                </>
              )}
              <div className="feed-card-categories">
                <p>{item.data.Category}</p>
              </div>
              <div className="feed-card-btn">
                <button className="view-btn">View Prompt</button>
              </div>
            </div>
          );
        })}
      </Masonry>

      {visibleCount < posts.length && (
        <div ref={loadMoreRef} className="load-more-trigger">
          <Loader />
        </div>
      )}

      <Footer />
    </>
  );
}

export default HomePage;
