import { useEffect, useRef, useState } from "react";
import API from "../api";
import Masonry from "react-masonry-css";

import CategoryFilter from "../components/CategoryFilter";
import ImageCard from "../components/ImageCard";
import MediaModal from "../components/MediaModal";
import AdCard from "../components/AdCard";
import Loader from "../components/Loader";

import "../styles/Feed.css";

function ImagesPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(15);

  const loadMoreRef = useRef(null);

  const breakpointColumnsObj = {
    default: 5,
    1400: 4,
    1100: 3,
    768: 2,
    500: 1,
  };

  useEffect(() => {
    setVisibleCount(15);
    fetchImages();
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchAds();
  }, []);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      ([entry]) => {
        if (entry.isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + 15, images.length));
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
      if (current) {
        observer.unobserve(current);
      }

      observer.disconnect();
    };
  }, [visibleCount, images.length]);

  if (loading) {
    return <Loader />;
  }

  const visibleImages = images.slice(0, visibleCount);

  const feedItems = [];

  visibleImages.forEach((image, index) => {
    feedItems.push({
      type: "image",
      data: image,
    });

    // Every 8 images ki oka ad
    if (ads.length > 0 && (index + 1) % 5 === 0) {
      feedItems.push({
        type: "ad",
        data: ads[Math.floor(index / 5) % ads.length],
      });
    }
  });

  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

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
            <ImageCard
              key={item.data._id}
              item={item.data}
              setSelectedItem={setSelectedItem}
            />
          );
        })}
      </Masonry>

      {visibleCount < images.length && (
        <div ref={loadMoreRef} className="load-more-trigger">
          <Loader />
        </div>
      )}

      <MediaModal
        item={selectedItem}
        closeModal={() => setSelectedItem(null)}
        setSelectedItem={setSelectedItem}
      />
    </>
  );
}

export default ImagesPage;
