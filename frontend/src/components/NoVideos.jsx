import React from "react";
import "../styles/NoVideos.css";
const NoVideos = () => {
  return (
    <div className="no-videos-container">
      <div className="no-videos-card">
        <div className="video-icon">🎬</div>

        <h1>No Videos Available Yet</h1>

        <p>Our video prompt collection is currently under development.</p>

        <p>Please visit again soon.</p>
      </div>
    </div>
  );
};

export default NoVideos;
