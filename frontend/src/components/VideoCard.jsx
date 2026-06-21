import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

function VideoCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="feed-card" onClick={() => navigate(`/prompt/${item.slug}`)}>
      <video src={item.mediaUrl} preload="metadata" muted />

      <div className="video-badge">
        <Play size={16} fill="white" />
      </div>

      <div className="feed-card-btn">
        <button className="view-btn">View Prompt</button>
      </div>
    </div>
  );
}

export default VideoCard;
