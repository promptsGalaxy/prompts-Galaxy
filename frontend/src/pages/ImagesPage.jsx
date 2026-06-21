import { useEffect, useRef, useState } from "react";
import API from "../api";
import Masonry from "react-masonry-css";
import { Helmet } from "react-helmet-async";

import CategoryFilter from "../components/CategoryFilter";
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

  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(
    cache ? JSON.parse(cache).category : "all",
  );

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

  useEffect(() => {
    fetchCategories();
    fetchAds();
  }, []);

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
      const data = JSON.parse(cached);

      if (data.category === selectedCategory) {
        setImages(data.images);
        setLoading(false);

        setTimeout(() => {
          const scroll = sessionStorage.getItem(SCROLL_KEY);

          if (scroll) {
            window.scrollTo(0, Number(scroll));
          }
        }, 100);

        return;
      }
    }

    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/prompts", {
        params: {
          mediaType: "image",
          category: selectedCategory,
        },
      });

      setImages(res.data);

      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          category: selectedCategory,
          images: res.data,
        }),
      );
    } catch (err) {
      console.log(err);
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

  const fetchCategories = async () => {
    try {
      const res = await API.get("/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await API.get("/api/ads");
      setAds(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    sessionStorage.setItem(VISIBLE_KEY, visibleCount);
  }, [visibleCount]);

  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY);
    };

    window.addEventListener("scroll", saveScroll);

    return () => {
      window.removeEventListener("scroll", saveScroll);
    };
  }, []);

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

  if (loading) return <Loader />;

  const visibleImages = images.slice(0, visibleCount);

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

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={(value) => {
          sessionStorage.removeItem(CACHE_KEY);
          sessionStorage.removeItem(SCROLL_KEY);
          sessionStorage.removeItem(VISIBLE_KEY);

          setVisibleCount(15);
          setSelectedCategory(value);
        }}
      />

      <Masonry
        key={`${selectedCategory}-${images.length}-${ads.length}`}
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-column"
      >
        {feedItems.map((item, index) => {
          if (item.type === "ad") {
            return (
              <div key={`ad-${item.data._id}`} className="feed-ad">
                <AdCard ad={item.data} />
              </div>
            );
          }

          return <ImageCard key={item.data._id} item={item.data} />;
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
