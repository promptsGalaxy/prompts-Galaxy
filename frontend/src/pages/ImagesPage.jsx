import { useEffect, useRef, useState } from "react";
import API from "../api";
import Masonry from "react-masonry-css";
import { Helmet } from "react-helmet-async";

import ImageCard from "../components/ImageCard";
import AdCard from "../components/AdCard";
import Loader from "../components/Loader";

import "../styles/Feed.css";
import Title from "../components/Title";
import Footer from "../components/Footer";

const CACHE_KEY = "images-cache";
const SCROLL_KEY = "images-scroll";
const VISIBLE_KEY = "images-visible";

function ImagesPage() {
  const cache = sessionStorage.getItem(CACHE_KEY);

  const [images, setImages] = useState(cache ? JSON.parse(cache).images : []);

  const [ads, setAds] = useState([]);

  const [loading, setLoading] = useState(!cache);

  const [visibleCount, setVisibleCount] = useState(() => {
    const saved = sessionStorage.getItem(VISIBLE_KEY);
    return saved ? Number(saved) : 15;
  });

  const loadMoreRef = useRef(null);

  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

  // Fetch Ads
  useEffect(() => {
    fetchAds();
  }, []);

  // Fetch Images
  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
      try {
        const data = JSON.parse(cached);

        setImages(data.images || []);
        setLoading(false);

        setTimeout(() => {
          const scroll = sessionStorage.getItem(SCROLL_KEY);

          if (scroll) {
            window.scrollTo(0, Number(scroll));
          }
        }, 100);

        return;
      } catch (err) {
        console.log("Cache parse error:", err);
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/prompts", {
        params: {
          mediaType: "image",
        },
      });

      setImages(res.data);

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          images: res.data,
        }),
      );
    } catch (err) {
      console.log("Error fetching images:", err);
    } finally {
      setLoading(false);

      setTimeout(() => {
        const scroll = sessionStorage.getItem(SCROLL_KEY);

        if (scroll) {
          window.scrollTo(0, Number(scroll));
        }
      }, 100);
    }
  };

  // Fetch Ads
  const fetchAds = async () => {
    try {
      const res = await API.get("/api/ads");
      setAds(res.data);
    } catch (err) {
      console.log("Error fetching ads:", err);
    }
  };

  // Save visible count
  useEffect(() => {
    sessionStorage.setItem(VISIBLE_KEY, visibleCount);
  }, [visibleCount]);

  // Save scroll position
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY);
    };

    window.addEventListener("scroll", saveScroll);

    return () => {
      window.removeEventListener("scroll", saveScroll);
    };
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + 15, images.length));
        }
      },
      {
        rootMargin: "400px",
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCount, images.length]);

  if (loading) {
    return <Loader />;
  }

  const visibleImages = images.slice(0, visibleCount);

  // Create feed with ads after every 6 images
  const feedItems = [];

  visibleImages.forEach((image, index) => {
    feedItems.push({
      type: "image",
      data: image,
    });

    if (ads.length && (index + 1) % 6 === 0) {
      feedItems.push({
        type: "ad",
        data: ads[Math.floor(index / 6) % ads.length],
      });
    }
  });

  return (
    <>
      <Helmet>
        <title>AI Image Prompts | MVR Prompts</title>
      </Helmet>

      <Title />

      <Masonry
        key={`${images.length}-${ads.length}`}
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {feedItems.map((item, index) => {
          if (item.type === "ad") {
            return (
              <div key={`ad-${item.data._id}-${index}`} className="feed-ad">
                <AdCard ad={item.data} />
              </div>
            );
          }

          return (
            <ImageCard
              key={`image-${item.data._id}-${index}`}
              item={item.data}
            />
          );
        })}
      </Masonry>

      {visibleCount < images.length && (
        <div ref={loadMoreRef}>
          <Loader />
        </div>
      )}

      <Footer />
    </>
  );
}

export default ImagesPage;
