require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const Prompt = require("./Prompt");
const Ad = require("./Ad");
const Click = require("./Click");
const sendTelegramPost = require("./telegram");

const app = express();

const { SitemapStream, streamToPromise } = require("sitemap");

connectDB();

/* =========================
   CORS
========================= */

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

/* =========================
   SLUG FUNCTIONS
========================= */

function createSlug(text = "") {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join("-");

  const random = Math.random().toString(36).substring(2, 8);

  return `${words}-${random}`;
}

async function generateSlug(text, currentId = null) {
  const baseSlug = createSlug(text);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Prompt.findOne({
      slug,
    }).select("_id");

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

    if (category && category.toLowerCase() !== "all") {
      query.Category = category;
    }

    if (search) {
      query.Prompt = {
        $regex: search,
        $options: "i",
      };
    }

    const data = await Prompt.aggregate([
      {
        $match: query,
      },
      {
        $sample: {
          size: 100,
        },
      },
    ]);

    res.json(data);
  } catch (err) {
    console.error("GET PROMPTS ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   CLICK
========================= */

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
   Category is stored as ARRAY

   Example:
   Category: ["men", "couple"]
========================= */

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Prompt.aggregate([
      {
        $match: {
          Category: {
            $exists: true,
            $type: "array",
            $ne: [],
          },
        },
      },

      // Array ni individual categories ga split chestundi
      {
        $unwind: "$Category",
      },

      // Empty values remove
      {
        $match: {
          Category: {
            $exists: true,
            $nin: ["", null],
          },
        },
      },

      // Same category count
      {
        $group: {
          _id: {
            $toLower: {
              $trim: {
                input: "$Category",
              },
            },
          },
          name: {
            $first: "$Category",
          },
          count: {
            $sum: 1,
          },
        },
      },

      // Highest count first
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    const result = categories.map((item) => ({
      name: item.name.trim(),

      count: item.count,

      slug: item.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("❌ GET CATEGORIES ERROR:", err);

    res.status(500).json({
      message: "Failed to load categories",
      error: err.message,
    });
  }
});

/* =====================================================
   GET PROMPTS BY CATEGORY

   Example:
   /api/prompts/category/men
   /api/prompts/category/women?page=2&limit=24
===================================================== */

app.get("/api/prompts/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(parseInt(req.query.limit) || 24, 50);

    const skip = (page - 1) * limit;

    const decodedCategory = decodeURIComponent(category);

    const filter = {
      Category: {
        $regex: `^${decodedCategory}$`,
        $options: "i",
      },
    };

    const [prompts, total] = await Promise.all([
      Prompt.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Prompt.countDocuments(filter),
    ]);

    res.status(200).json({
      prompts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET CATEGORY PROMPTS ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch category prompts",
      error: err.message,
    });
  }
});

/* =========================
   SEARCH
========================= */

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

/* =========================
   GET PROMPT BY SLUG
========================= */

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
          _id: -1,
        },
      },
      {
        $limit: 100,
      },
      {
        $sample: {
          size: 50,
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
   GET ADS
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

/* =========================
   CREATE PROMPT
========================= */

app.post("/api/prompts", async (req, res) => {
  try {
    req.body.slug = await generateSlug(req.body.Prompt);

    const prompt = await Prompt.create(req.body);

    /* Telegram */

    try {
      await sendTelegramPost(prompt);
    } catch (e) {
      console.log("Telegram Error:", e.message);
    }

    res.status(201).json(prompt);
  } catch (err) {
    console.error("CREATE PROMPT ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   UPDATE PROMPT
========================= */

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

/* =========================
   DELETE PROMPT
========================= */

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
    res.status(500).json({
      message: err.message,
    });
  }
});

/* =========================
   AD VIEW
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
   AD CLICK
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

/* =====================================================
   SITEMAP
===================================================== */

app.get("/sitemap.xml", async (req, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: "https://mvrprompts.com",
    });

    /* HOME */

    smStream.write({
      url: "/",
      changefreq: "daily",
      priority: 1.0,
    });

    /* IMAGES */

    smStream.write({
      url: "/images",
      changefreq: "daily",
      priority: 0.8,
    });

    /* VIDEOS */

    smStream.write({
      url: "/videos",
      changefreq: "daily",
      priority: 0.8,
    });

    /* CATEGORIES */

    smStream.write({
      url: "/categories",
      changefreq: "weekly",
      priority: 0.9,
    });

    const categories = await Prompt.distinct("Category");

    categories.forEach((category) => {
      if (!category) return;

      const slug = String(category)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (slug) {
        smStream.write({
          url: `/categories/${slug}`,
          changefreq: "daily",
          priority: 0.7,
        });
      }
    });

    /* PROMPTS */

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
    console.error("SITEMAP ERROR:", err);

    res.status(500).send(err.message);
  }
});
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MVR Prompts API is running",
    timestamp: new Date().toISOString(),
  });
});
/* =========================
   SERVER
========================= */

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
