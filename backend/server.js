require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const Prompt = require("./Prompt");
const Ad = require("./Ad");
const Click = require("./Click");

const app = express();
const { SitemapStream, streamToPromise } = require("sitemap");

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://prompts-admin-panel-devil.vercel.app",
      "https://mvrprompts.vercel.app",
      "https://mvrprompts.com",
      "https://www.mvrprompts.com",
    ],
  }),
);
app.use(express.json());

function createSlug(text = "") {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 8) // First 8 words only
    .join("-");

  const random = Math.random().toString(36).substring(2, 8);

  return `${words}-${random}`;
}
async function generateSlug(text, currentId = null) {
  const baseSlug = createSlug(text);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Prompt.findOne({ slug }).select("_id");

    if (!existing) break;

    if (currentId && existing._id.toString() === currentId) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
/* =========================
   GET PROMPTS
========================= */
app.get("/api/prompts", async (req, res) => {
  try {
    const { mediaType, category, search } = req.query;

    const query = {};
    if (mediaType) {
      query.mediaType = mediaType;
    }

    if (category && category !== "all") {
      query.Category = category;
    }

    if (search) {
      query.Prompt = {
        $regex: search,
        $options: "i",
      };
    }

    const data = await Prompt.aggregate([
      { $match: query },
      { $sample: { size: 100 } },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});
app.get("/api/click", async (req, res) => {
  try {
    const post = await Click.findOne();

    res.json(post);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET CATEGORIES
========================= */
app.get("/api/categories", async (req, res) => {
  try {
    res.json([
      "men",
      "women",
      "couple",
      "kid",
      "editing",
      "family",
      "group",
      "others",
    ]);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const data = await Prompt.find({
      Prompt: {
        $regex: q,
        $options: "i",
      },
    }).limit(50);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET SINGLE PROMPT
========================= */
app.get("/api/prompts/:id", async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);

    if (!prompt) {
      return res.status(404).json({
        message: "Prompt not found",
      });
    }

    res.json(prompt);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/api/prompts/slug/:slug", async (req, res) => {
  try {
    const prompt = await Prompt.findOne({
      slug: req.params.slug,
    });

    if (!prompt) {
      return res.status(404).json({
        message: "Prompt not found",
      });
    }

    res.json(prompt);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   INCREASE PROMPT VIEW
========================= */

app.post("/api/prompts/:id/view", async (req, res) => {
  try {
    const prompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      },
    );

    res.json(prompt);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   TRENDING PROMPTS
========================= */
app.get("/api/trending", async (req, res) => {
  try {
    const data = await Prompt.aggregate([
      {
        $sort: {
          _id: -1, // latest posts first
        },
      },
      {
        $limit: 100, // latest 100 posts
      },
      {
        $sample: {
          size: 50, // shuffle those 100 posts
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   GET ADS WITH PRIORITY
========================= */
app.get("/api/ads", async (req, res) => {
  try {
    const ads = await Ad.find({
      active: true,
    });

    if (!ads.length) {
      return res.status(404).json({
        message: "No active ads found",
      });
    }

    const weightedAds = [];

    ads.forEach((ad) => {
      const priority = Math.max(1, Math.min(10, ad.priority || 1));

      for (let i = 0; i < priority; i++) {
        weightedAds.push(ad);
      }
    });

    for (let i = weightedAds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [weightedAds[i], weightedAds[j]] = [weightedAds[j], weightedAds[i]];
    }

    res.json(weightedAds);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.post("/api/prompts", async (req, res) => {
  try {
    req.body.slug = await generateSlug(req.body.Prompt);

    const prompt = await Prompt.create(req.body);

    res.status(201).json(prompt);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.put("/api/prompts/:id", async (req, res) => {
  try {
    req.body.slug = await generateSlug(req.body.Prompt, req.params.id);

    const updatedPrompt = await Prompt.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedPrompt) {
      return res.status(404).json({
        message: "Prompt not found",
      });
    }

    res.json(updatedPrompt);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.delete("/api/prompts/:id", async (req, res) => {
  try {
    const deletedPrompt = await Prompt.findByIdAndDelete(req.params.id);

    if (!deletedPrompt) {
      return res.status(404).json({
        message: "Prompt not found",
      });
    }

    res.json({
      success: true,
      message: "Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   AD VIEW COUNT
========================= */
app.post("/api/ads/:id/view", async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, {
      $inc: {
        views: 1,
      },
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   AD CLICK COUNT
========================= */
app.post("/api/ads/:id/click", async (req, res) => {
  try {
    await Ad.findByIdAndUpdate(req.params.id, {
      $inc: {
        clicks: 1,
      },
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: "https://mvrprompts.com",
    });

    smStream.write({
      url: "/",
      changefreq: "daily",
      priority: 1.0,
    });

    smStream.write({
      url: "/images",
    });

    smStream.write({
      url: "/videos",
    });

    const prompts = await Prompt.find({}, "slug updatedAt");

    prompts.forEach((prompt) => {
      if (prompt.slug) {
        smStream.write({
          url: `/prompt/${prompt.slug}`,
          lastmod: prompt.updatedAt,
          changefreq: "weekly",
          priority: 0.8,
        });
      }
    });

    smStream.end();

    const sitemap = await streamToPromise(smStream);

    res.header("Content-Type", "application/xml");
    res.send(sitemap.toString());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* =========================
   SERVER
========================= */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
