import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api";
import { Helmet } from "react-helmet-async";
import ImageCard from "../components/ImageCard";
import VideoCard from "../components/VideoCard";
import Title from "../components/Title";
import Footer from "../components/Footer";

function SearchResultsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (query.trim()) {
      fetchResults();
    } else {
      setPosts([]);
    }
  }, [query]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/search", {
        params: {
          q: query,
        },
      });

      setPosts(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Search AI Prompts | MVR Prompts</title>

        <meta
          name="description"
          content="Search thousands of AI image and video prompts by keyword, category or style. Find the perfect prompt instantly with MVR Prompts."
        />

        <meta
          name="keywords"
          content="search AI prompts, prompt search, image prompts, video prompts, MVR Prompts"
        />
      </Helmet>
      <Title />

      <h2 className="search-title">Search Results: {query}</h2>

      {loading && <p>Loading...</p>}

      {!loading && posts.length === 0 && <p>No results found</p>}

      <div className="grid">
        {posts.map((item) =>
          item.mediaType === "image" ? (
            <ImageCard key={item._id} item={item} />
          ) : (
            <VideoCard key={item._id} item={item} />
          ),
        )}
      </div>
      <Footer />
    </>
  );
}

export default SearchResultsPage;
