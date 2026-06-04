function VideoCard({ item, setSelectedItem }) {
  return (
    <div className="card" onClick={() => setSelectedItem(item)}>
      <video src={item.mediaUrl} />
    </div>
  );
}

export default VideoCard;
