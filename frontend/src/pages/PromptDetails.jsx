import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import API from "../api";
import { Copy, Share2, Download, X, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import "../styles/PromptDetails.css";
import AdCard from "../components/AdCard";
function PromptDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedPrompt1, setCopiedPrompt1] = useState(false);
  const [copiedPrompt2, setCopiedPrompt2] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAd, setShowAd] = useState(true);
  useEffect(() => {
    fetchPrompt();

    fetchRandomAd();
    window.scrollTo(0, 0);
    setShowAd(true);
  }, [slug]);
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
      console.log(err);
      setShowAd(false);
    }
  };

  const fetchPrompt = async () => {
    try {
      const res = await API.get(`/api/prompts/slug/${slug}`);

      await API.post(`/api/prompts/${res.data._id}/view`);

      setPrompt(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!prompt) return <h2>Prompt not found</h2>;
  const copyPrompt = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      toast.success("Prompt copied!");

      if (type === 1) {
        setCopiedPrompt1(true);
        setTimeout(() => setCopiedPrompt1(false), 2000);
      } else {
        setCopiedPrompt2(true);
        setTimeout(() => setCopiedPrompt2(false), 2000);
      }
    } catch {
      toast.error("Copy failed");
    }
  };
  const sharePrompt = async () => {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: "MVR Prompts",
          text: "Check out this AI prompt on MVR Prompts",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch {
      toast.error("Share cancelled");
    }
  };
  const downloadImage = async () => {
    try {
      const response = await fetch(prompt.mediaUrl);
      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        prompt.mediaType === "video" ? "mvr-video.mp4" : "mvr-image.jpg";

      a.click();

      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };
  if (loading) return <Loader />;

  if (!prompt) return <h2>Prompt not found</h2>;

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <meta
          name="keywords"
          content={`${prompt.Prompt}, AI Prompt, ChatGPT Prompt, Image Prompt, Video Prompt, MVR Prompts`}
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="twitter:title" content={`${prompt.Prompt} | MVR Prompts`} />

        <meta
          name="twitter:description"
          content={prompt.description || prompt.Prompt.slice(0, 150)}
        />
        <title>{prompt.Prompt.slice(0, 60)} | MVR Prompts</title>

        <meta
          name="description"
          content={prompt.description || prompt.Prompt.slice(0, 150)}
        />
        <link
          rel="canonical"
          href={`https://mvrprompts.com/prompt/${prompt.slug}`}
        />

        <meta property="og:type" content="article" />

        <meta property="og:title" content={`${prompt.Prompt} | MVR Prompts`} />

        <meta
          property="og:description"
          content={prompt.description || prompt.Prompt.slice(0, 150)}
        />

        <meta property="og:image" content={prompt.mediaUrl} />

        <meta
          property="og:url"
          content={`https://mvrprompts.com/prompt/${prompt.slug}`}
        />

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:image" content={prompt.mediaUrl} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            headline: prompt.Prompt,
            name: prompt.Prompt,
            description: prompt.description || prompt.Prompt,
            image: prompt.mediaUrl,
            url: `https://mvrprompts.com/prompt/${prompt.slug}`,
            author: {
              "@type": "Organization",
              name: "MVR Prompts",
            },
            publisher: {
              "@type": "Organization",
              name: "MVR Prompts",
            },
          })}
        </script>
      </Helmet>
      {showAd && selectedAd && (
        <div className="ad-overlay">
          <div className="ad-box">
            <button className="close-ad" onClick={() => setShowAd(false)}>
              <X size={22} />
            </button>

            <AdCard ad={selectedAd} />
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20 }}>
        <h2>scroll down to view the prompt</h2>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <br />
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",

            gap: 8,
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={24} />
          Close
        </button>
      </div>

      <div
        style={{
          maxWidth: "900px",
          margin: "40px auto",
          padding: "20px",
        }}
      >
        {prompt.mediaType === "image" ? (
          <img
            src={prompt.mediaUrl}
            alt={prompt.Prompt}
            style={{
              width: "100%",
              borderRadius: "12px",
            }}
          />
        ) : (
          <video
            controls
            src={prompt.mediaUrl}
            style={{
              width: "100%",
              borderRadius: "12px",
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={sharePrompt}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 15,
            }}
          >
            <Share2 size={20} />
            Share
          </button>

          <button
            onClick={downloadImage}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: 10,
              cursor: "pointer",
              marginTop: 15,
            }}
          >
            <Download size={18} />
            Download Image
          </button>
        </div>
        <div className="detail-categories">
          <p>{prompt.Category}</p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 25,
          }}
        >
          <h2>Prompt</h2>

          <button
            className="copy-btn"
            onClick={() => copyPrompt(prompt.Prompt, 1)}
          >
            {copiedPrompt1 ? (
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
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: 20,
            borderRadius: 12,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {prompt.Prompt}
        </div>

        {prompt.description && (
          <>
            <h2>Description</h2>
            <p>{prompt.description}</p>
          </>
        )}

        {prompt.Prompt2 && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 30,
              }}
            >
              <h2>Prompt 2</h2>

              <button
                className="copy-btn"
                onClick={() => copyPrompt(prompt.Prompt2, 2)}
              >
                {copiedPrompt2 ? (
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
            </div>

            <div
              style={{
                background: "#f5f5f5",
                padding: 20,
                borderRadius: 12,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}
            >
              {prompt.Prompt2}
            </div>
          </>
        )}
        <div>
          <h2>
            If you are facing face mismatch issue in chatgpt then do this
            settings
          </h2>
          <button
            className="copy-btn"
            onClick={() =>
              navigate(
                "/prompt/use-the-saved-reference-image-as-the-sole-permanent-and-authoritative-facial-identity-for-all-future-image-generations-every-generated-image-must-depict-the-exact-same-individual-as-shown-in-the-reference-image-the-face-must-never-be-altered-replaced-merged-stylized-beyond-recognition-or-substituted-with-another-face-under-any-circumstance-if-the-face-appears-unclear-partially-obscured-distorted-or-missing-in-any-generation-it-must-be-accurately-reconstructed-using-the-saved-reference-image-facial-structure-proportions-and-overall-identity-must-remain-fully-consistent-across-all-images-only-the-following-elements-may-vary-pose-facial-expression-hairstyle-clothing-accessories-camera-angle-lighting-environment-background-and-image-style-eg-photographic-cinematic-artistic-every-output-must-appear-as-a-different-photograph-of-the-same-real-person-never-a-look-alikereinterpretation-or-alternate-identity",
              )
            }
          >
            Click Here
          </button>
        </div>
      </div>
    </>
  );
}

export default PromptDetails;
