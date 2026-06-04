import { Fragment, useEffect, useState } from "react";
import API from "../api";

import CategoryFilter from "../components/CategoryFilter";
import ImageCard from "../components/ImageCard";
import MediaModal from "../components/MediaModal";
import AdCard from "../components/AdCard";

import "../styles/Feed.css";

function ImagesPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchAds();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await API.get("/api/prompts", {
        params: {
          mediaType: "image",
          category: selectedCategory,
        },
      });

      setImages(res.data);
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

  return (
    <>
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <div className="grid">
        {images.map((item, index) => (
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

      <MediaModal
        item={selectedItem}
        closeModal={() => setSelectedItem(null)}
      />
    </>
  );
}

export default ImagesPage;
