import { useNavigate } from "react-router-dom";

function ImageCard({ item }) {
  const navigate = useNavigate();

  return (
    <div className="feed-card" onClick={() => navigate(`/prompt/${item.slug}`)}>
      <img
        src={item.mediaUrl}
        alt={item.title || "Prompt Image"}
        loading="lazy"
        decoding="async"
        onLoad={() => window.dispatchEvent(new Event("resize"))}
      />
      <div className="feed-card-categories">
        <p>{item.Category}</p>
      </div>

      <div className="feed-card-btn">
        <button className="view-btn">View Prompt</button>
      </div>
    </div>
  );
}

export default ImageCard;
