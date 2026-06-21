import React from "react";

function ImageCard({ item, setSelectedItem }) {
  return (
    <div className="feed-card" onClick={() => setSelectedItem(item)}>
      <img
        src={item.mediaUrl}
        alt={item.title || "Prompt Image"}
        loading="lazy"
        decoding="async"
      />
      <div className="feed-card-btn">
        <button className="view-btn">View Prompt</button>
      </div>
    </div>
  );
}

export default ImageCard;
