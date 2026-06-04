import React from "react";
function ImageCard({ item, setSelectedItem }) {
  return (
    <div className="card" onClick={() => setSelectedItem(item)}>
      <img src={item.mediaUrl} alt="" />
    </div>
  );
}

export default ImageCard;
