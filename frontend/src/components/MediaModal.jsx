import "../styles/MediaModal.css";
import { useEffect, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import API from "../api";
import AdCard from "./AdCard";

function MediaModal({ item, closeModal }) {
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAd, setShowAd] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item?._id) {
      API.post(`/api/prompts/${item._id}/view`);
    }
  }, [item]);

  useEffect(() => {
    if (item) {
      fetchRandomAd();
      setShowAd(true);
      setCopied(false);
    }
  }, [item]);

  const fetchRandomAd = async () => {
    try {
      const res = await API.get("/api/ads");

      if (res.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * res.data.length);

        setSelectedAd(res.data[randomIndex]);
      } else {
        setSelectedAd(null);
        setShowAd(false);
      }
    } catch (err) {
      console.log("No ads available");
      setShowAd(false);
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(item.Prompt);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.log(err);
    }
  };

  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {showAd && selectedAd ? (
          <div className="ad-screen">
            <button className="close-btn" onClick={() => setShowAd(false)}>
              <X size={24} />
            </button>

            <div className="modal-ad">
              <AdCard ad={selectedAd} />
            </div>
          </div>
        ) : (
          <>
            <button className="close-btn" onClick={closeModal}>
              <X size={24} />
            </button>

            {item.mediaType === "image" ? (
              <img src={item.mediaUrl} alt="Prompt" className="modal-media" />
            ) : (
              <video
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
                src={item.mediaUrl}
                className="modal-media"
              />
            )}

            <div className="prompt-section">
              <h3>Prompt</h3>

              <p className="prompt-text">{item.Prompt}</p>

              {item.prompt2 && (
                <>
                  <h3>Prompt 2</h3>

                  <p className="prompt-text">{item.prompt2}</p>
                </>
              )}

              {item.description && (
                <>
                  <h3>Description</h3>

                  <p className="prompt-text">{item.description}</p>
                </>
              )}
            </div>

            <button className="copy-btn" onClick={copyPrompt}>
              {copied ? (
                <>
                  <Check size={18} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MediaModal;
