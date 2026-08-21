import { Fragment, useEffect, useRef, useState } from "react";
import API from "../api";
import { Helmet } from "react-helmet-async";
import AdCard from "../components/AdCard";
import Loader from "../components/Loader";

import "../styles/Reels.css";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import NoVideos from "../components/NoVideos";

function VideosPage() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [muted, setMuted] = useState(true);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const videoRefs = useRef([]);

  // Fetch Videos
  useEffect(() => {
    fetchVideos();
  }, []);

  // Fetch Ads
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await API.get("/api/prompts", {
        params: {
          mediaType: "video",
        },
      });

      setVideos(res.data);
      videoRefs.current = [];
    } catch (err) {
      console.error("Error fetching videos:", err);
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

  // Auto play / pause videos based on visibility
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

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Helmet>
        <title>AI Video Prompts | MVR Prompts</title>

        <meta
          name="description"
          content="Explore professional AI video prompts for Veo, Kling, Runway, Pika and other AI video generators. Create stunning cinematic videos effortlessly."
        />

        <meta
          name="keywords"
          content="AI video prompts, Veo prompts, Kling prompts, Runway prompts, cinematic video prompts, AI animation prompts"
        />
      </Helmet>

      <Title />

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
                  <button className="mute-btn" onClick={() => setMuted(!muted)}>
                    {muted ? "🔇 Unmute" : "🔊 Mute"}
                  </button>

                  <button
                    className="prompt-btn"
                    onClick={() => navigate(`/prompt/${item.slug}`)}
                  >
                    View Prompt
                  </button>
                </div>
              </div>
            </div>

            {/* Ad Reel after every 6 videos */}
            {ads.length > 0 && (index + 1) % 6 === 0 && (
              <div className="reel-item">
                <div className="ad-reel">
                  <AdCard ad={ads[Math.floor(index / 6) % ads.length]} />
                </div>
              </div>
            )}
          </Fragment>
        ))}

        {/* No Videos */}
        {videos.length === 0 && <NoVideos />}

        <Footer />
      </div>
    </>
  );
}

export default VideosPage;
