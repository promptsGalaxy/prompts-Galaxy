import { useEffect, useRef } from "react";
import API from "../api";

function AdCard({ ad }) {
  const adRef = useRef(null);
  const countedRef = useRef(false);

  useEffect(() => {
    if (!ad?._id) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countedRef.current) {
          countedRef.current = true;
          API.post(`/api/ads/${ad._id}/view`);
        }
      },
      {
        threshold: 0.5,
      },
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [ad]);

  const handleClick = async () => {
    try {
      await API.post(`/api/ads/${ad._id}/click`);

      if (ad.redirectUrl) {
        window.open(ad.redirectUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!ad) return null;

  return (
    <div ref={adRef} className="ad-card" onClick={handleClick}>
      <div className="ad-image-wrapper">
        <span className="ad-badge">{ad.badge}</span>

        <img
          className="ad-image"
          src={ad.imageUrl}
          alt={ad.title}
          loading="lazy"
        />
      </div>

      <div className="ad-content">
        <h3 className="ad-title">{ad.title}</h3>

        <p className="ad-views">👁 {ad.views || 0} Views</p>

        <button className="ad-btn">{ad.btn}</button>
      </div>
    </div>
  );
}

export default AdCard;
