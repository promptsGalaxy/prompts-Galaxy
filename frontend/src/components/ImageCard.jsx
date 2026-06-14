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
    </div>
  );
}

export default ImageCard;
