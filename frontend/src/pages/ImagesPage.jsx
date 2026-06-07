import { Fragment, useEffect, useRef, useState } from "react";
import API from "../api";

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
      (entries) => {
        const target = entries[0];

        if (target.isIntersecting && visibleCount < images.length) {
          setVisibleCount((prev) => Math.min(prev + 10, images.length));
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
  }, [visibleCount, images.length]);

  if (loading) {
    return <Loader />;
  }

  const visibleImages = images.slice(0, visibleCount);

  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="grid">
        {visibleImages.map((item, index) => (
          <Fragment key={item._id}>
            <ImageCard item={item} setSelectedItem={setSelectedItem} />

            {ads.length > 0 && (index + 1) % 5 === 0 && (
              <div className="feed-ad">
                <AdCard ad={ads[Math.floor(index / 5) % ads.length]} />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {visibleCount < images.length && (
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

export default ImagesPage;
