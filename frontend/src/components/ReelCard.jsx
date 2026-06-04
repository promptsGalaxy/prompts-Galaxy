import { useEffect, useRef } from "react";

function ReelCard({ item, setSelectedItem }) {
  const videoRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      },
      {
        threshold: 0.8,
      },
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="reel">
      <video ref={videoRef} src={item.mediaUrl} loop muted playsInline />

      <div className="reel-info">
        <button onClick={() => setSelectedItem(item)}>View Prompt</button>
      </div>
    </div>
  );
}

export default ReelCard;
