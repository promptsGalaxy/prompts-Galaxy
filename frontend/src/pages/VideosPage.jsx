import { Fragment, useEffect, useRef, useState } from "react";
import API from "../api";

import CategoryFilter from "../components/CategoryFilter";
import MediaModal from "../components/MediaModal";
import AdCard from "../components/AdCard";

import "../styles/Reels.css";

function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [muted, setMuted] = useState(true);
  const [ads, setAds] = useState([]);

  const videoRefs = useRef([]);

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchAds();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await API.get("/api/prompts", {
        params: {
          mediaType: "video",
          category: selectedCategory,
        },
      });

      setVideos(res.data);
      videoRefs.current = [];
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/api/categories");
      setCategories(res.data);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector("video");

          if (!video) return;

          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      {
        threshold: 0.8,
      },
    );

    const reels = document.querySelectorAll(".reel-item");

    reels.forEach((reel) => observer.observe(reel));

    return () => observer.disconnect();
  }, [videos]);

  return (
    <>
      <div className="reels-categories">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      <div className="reels-container">
        {videos.map((item, index) => (
          <Fragment key={item._id}>
            {/* Video Reel */}
            <div className="reel-item">
              <div className="reel-content">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={item.mediaUrl}
                  className="reel-video"
                  controls
                  playsInline
                  muted={muted}
                />

                <div className="reel-bottom">
                  <button
                    className="prompt-btn"
                    onClick={() => setSelectedItem(item)}
                  >
                    View Prompt
                  </button>

                  <button className="mute-btn" onClick={() => setMuted(!muted)}>
                    {muted ? "🔇 Unmute" : "🔊 Mute"}
                  </button>

                  <div className="views-count">👁 {item.views || 0}</div>
                </div>
              </div>
            </div>

            {/* Ad Reel */}
            {ads.length > 0 && (index + 1) % 5 === 0 && (
              <div className="reel-item">
                <div className="ad-reel">
                  <AdCard ad={ads[Math.floor(index / 3) % ads.length]} />
                </div>
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

export default VideosPage;
